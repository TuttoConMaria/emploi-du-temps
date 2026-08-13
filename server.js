const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'schedules.json');

app.use(express.json());
app.use(express.static('.'));

// Helper : Charger les données sauvegardées sur le disque
function loadSchedules() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return data ? JSON.parse(data) : [];
        }
    } catch (err) {
        console.error("Erreur de lecture du fichier schedules.json :", err);
    }
    return [];
}

// Helper : Sauvegarder les données sur le disque
function saveSchedules(schedules) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(schedules, null, 2), 'utf8');
    } catch (err) {
        console.error("Erreur de sauvegarde dans schedules.json :", err);
    }
}

// Initialisation du tableau avec les données existantes
let schedules = loadSchedules();

// Récupérer tous les emplois du temps
app.get('/api/schedules', (req, res) => {
    res.json(schedules);
});

// Enregistrer un nouvel emploi du temps
app.post('/api/schedules', (req, res) => {
    const newSchedule = { id: Date.now().toString(), ...req.body };
    
    const conflict = checkConflict(newSchedule);
    if (conflict) {
        return res.status(400).json({ error: conflict });
    }

    schedules.push(newSchedule);
    saveSchedules(schedules); // Sauvegarde automatique
    res.status(201).json(newSchedule);
});

// Modifier un emploi du temps existant
app.put('/api/schedules/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = { id: id, ...req.body };

    const conflict = checkConflict(updatedData, id);
    if (conflict) {
        return res.status(400).json({ error: conflict });
    }

    const index = schedules.findIndex(s => s.id === id || s.id == id);
    if (index !== -1) {
        schedules[index] = updatedData;
        saveSchedules(schedules); // Sauvegarde automatique
        res.json(schedules[index]);
    } else {
        res.status(404).send('Emploi du temps non trouvé');
    }
});

// Contrôle ciblé des chevauchements d'horaires
function checkConflict(incoming, currentId = null) {
    if (!incoming.schedule) return null;

    for (const existing of schedules) {
        if (currentId && (existing.id === currentId || existing.id == currentId)) continue;
        if (!existing.schedule) continue;

        // On vérifie s'il y a un conflit de classe ou d'enseignant
        const sameClass = existing.className && incoming.className && (existing.className === incoming.className);
        const sameTeacher = existing.teacherName && incoming.teacherName && 
                            (existing.teacherName.trim().toLowerCase() === incoming.teacherName.trim().toLowerCase());

        // Si ce n'est ni la même classe ni le même prof, il n'y a pas de conflit
        if (!sameClass && !sameTeacher) continue;

        for (const day in incoming.schedule) {
            for (const hour in incoming.schedule[day]) {
                const incomingVal = incoming.schedule[day][hour];
                const existingVal = existing.schedule[day] ? existing.schedule[day][hour] : null;

                if (incomingVal && incomingVal.trim() !== '' && existingVal && existingVal.trim() !== '') {
                    if (sameClass) {
                        return `La classe ${incoming.className} a déjà un cours prévu le ${day.toUpperCase()} (${hour}).`;
                    }
                    if (sameTeacher) {
                        return `L'enseignant ${incoming.teacherName} est déjà programmé en ${existing.className} le ${day.toUpperCase()} (${hour}).`;
                    }
                }
            }
        }
    }
    return null;
}

// Supprimer UN emploi du temps
app.delete('/api/schedules/:id', (req, res) => {
    const { id } = req.params;
    schedules = schedules.filter((s, idx) => s.id !== id && idx != id);
    saveSchedules(schedules); // Sauvegarde après suppression
    res.sendStatus(200);
});

// Supprimer TOUS les emplois du temps
app.delete('/api/schedules', (req, res) => {
    schedules = [];
    saveSchedules(schedules); // Sauvegarde après réinitialisation
    res.sendStatus(200);
});

// Démarrage du serveur (compatible Render)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
