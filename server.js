const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tuttoconmaria_db_user:S%40ntos95@cluster0.fruilcf.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB Atlas'))
.catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

const scheduleSchema = new mongoose.Schema({
    className: { type: String, required: true, unique: true },
    schedule: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

// Récupérer tous les emplois du temps
app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find().sort({ className: 1 });
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Enregistrer ou modifier un créneau
app.post('/api/schedules', async (req, res) => {
    try {
        const { className, day, hour, subject, teacherName } = req.body;

        if (!className || !day || !hour) {
            return res.status(400).json({ message: 'className, day et hour sont requis' });
        }

        let scheduleDoc = await Schedule.findOne({ className });

        if (!scheduleDoc) {
            scheduleDoc = new Schedule({
                className,
                schedule: {}
            });
        }

        if (!scheduleDoc.schedule) {
            scheduleDoc.schedule = {};
        }
        if (!scheduleDoc.schedule[day]) {
            scheduleDoc.schedule[day] = {};
        }

        // Enregistrement sous forme d'objet propre pour la case
        scheduleDoc.schedule[day][hour] = {
            subject: subject || '',
            teacherName: teacherName || 'Non spécifié'
        };

        scheduleDoc.markModified('schedule');
        scheduleDoc.updatedAt = new Date();
        
        const savedSchedule = await scheduleDoc.save();
        res.json(savedSchedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Supprimer un créneau spécifique (Route DELETE)
app.delete('/api/schedules/cell', async (req, res) => {
    try {
        const { className, day, hour } = req.body;

        if (!className || !day || !hour) {
            return res.status(400).json({ message: 'className, day et hour sont requis' });
        }

        const scheduleDoc = await Schedule.findOne({ className });
        if (!scheduleDoc) {
            return res.status(404).json({ message: 'Classe non trouvée' });
        }

        if (scheduleDoc.schedule && scheduleDoc.schedule[day]) {
            delete scheduleDoc.schedule[day][hour];
            scheduleDoc.markModified('schedule');
            scheduleDoc.updatedAt = new Date();
            await scheduleDoc.save();
        }

        res.json({ message: 'Créneau supprimé avec succès', data: scheduleDoc });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

