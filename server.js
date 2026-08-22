const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à MongoDB Atlas (utilise la variable d'environnement ou l'URI directe)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:S%40ntos95@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB Atlas'))
.catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// Définition du modèle de données pour l'Emploi du Temps
const scheduleSchema = new mongoose.Schema({
    className: String,
    teacherName: String,
    subject: String,
    phone: String,
    schedule: Object
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

// 1. Route pour récupérer tous les emplois du temps
app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find();
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Route pour récupérer un emploi du temps par son ID
app.get('/api/schedules/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Non trouvé' });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Route pour MODIFIER / SAUVEGARDER un emploi du temps (C'est celle-ci qui manquait ou bloquait)
app.put('/api/schedules/:id', async (req, res) => {
    try {
        const updatedSchedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedSchedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Route pour SUPPRIMER un emploi du temps
app.delete('/api/schedules/:id', async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Supprimé avec succès' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Port d'écoute
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
