const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'timetables.json');

app.use(express.json());
app.use(express.static(__dirname));

// Récupérer tous les emplois du temps enregistrés
app.get('/api/schedules', (req, res) => {
    if (!fs.existsSync(DATA_FILE)) {
        return res.json([]);
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data || '[]'));
});

// Enregistrer un nouvel emploi du temps
app.post('/api/save', (req, res) => {
    const newEntry = req.body;
    let existingData = [];

    if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        existingData = JSON.parse(fileContent || '[]');
    }

    existingData.push(newEntry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2));

    res.json({ message: 'Enregistré avec succès !' });
});

app.listen(PORT, () => {
    console.log(`Serveur prêt sur http://localhost:${PORT}`);
});