const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

let schedules = [];

// Récupérer tous les emplois du temps
app.get('/api/schedules', (req, res) => {
    res.json(schedules);
});

// Enregistrer un nouvel emploi du temps
app.post('/api/schedules', (req, res) => {
    const newSchedule = { id: Date.now().toString(), ...req.body };
    
    // Vérification des créneaux déjà occupés
    const conflict = checkConflict(newSchedule);
    if (conflict) {
        return res.status(400).json({ error: conflict });
    }

    schedules.push(newSchedule);
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
        res.json(schedules[index]);
    } else {
        res.status(404).send('Emploi du temps non trouvé');
    }
});

// Fonction pour détecter si une case horaire est déjà prise par un collègue
function checkConflict(incoming, currentId = null) {
    for (const existing of schedules) {
        if (currentId && (existing.id === currentId || existing.id == currentId)) continue;
        if (!existing.schedule) continue;

        for (const day in incoming.schedule) {
            for (const hour in incoming.schedule[day]) {
                const incomingVal = incoming.schedule[day][hour];
                const existingVal = existing.schedule[day] ? existing.schedule[day][hour] : null;

                if (incomingVal && existingVal) {
                    return `Le créneau ${day.toUpperCase()} (${hour}) est déjà occupé par ${existing.teacherName} (${existingVal}).`;
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
    res.sendStatus(200);
});

// Supprimer TOUS les emplois du temps
app.delete('/api/schedules', (req, res) => {
    schedules = [];
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
