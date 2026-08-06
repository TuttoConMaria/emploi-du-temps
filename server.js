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

// Ajouter un emploi du temps
app.post('/api/schedules', (req, res) => {
    const newSchedule = { id: Date.now().toString(), ...req.body };
    schedules.push(newSchedule);
    res.status(201).json(newSchedule);
});

// Modifier un emploi du temps
app.put('/api/schedules/:id', (req, res) => {
    const { id } = req.params;
    const index = schedules.findIndex(s => s.id === id || s.id == id);
    if (index !== -1) {
        schedules[index] = { id: id, ...req.body };
        res.json(schedules[index]);
    } else {
        res.status(404).send('Emploi du temps non trouvé');
    }
});

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
