const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Connexion à MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tuttoconmaria_db_user:S%40ntos95@cluster0.fruilcf.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB Atlas'))
.catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// Définition du modèle de données
const scheduleSchema = new mongoose.Schema({
    className: String,
    teacherName: String,
    subject: String,
    phone: String,
    schedule: Object
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

// Routes

// GET - Récupérer tous les emplois
app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find();
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST - Créer un nouvel emploi
app.post('/api/schedules', async (req, res) => {
    try {
        const newSchedule = new Schedule(req.body);
        const savedSchedule = await newSchedule.save();
        res.json(savedSchedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET - Récupérer par ID
app.get('/api/schedules/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Non trouvé' });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT - Modifier un emploi
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

// DELETE - Supprimer un emploi
app.delete('/api/schedules/:id', async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Supprimé avec succès' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
