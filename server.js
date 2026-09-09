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
    className: String,
    teacherName: String,
    subject: String,
    phone: String,
    schedule: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find().sort({ className: 1 });
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/schedules', async (req, res) => {
    try {
        const { className, teacherName, subject, schedule } = req.body;

        if (!className) {
            return res.status(400).json({ message: 'className est requis' });
        }

        let scheduleDoc = await Schedule.findOne({ className });

        if (!scheduleDoc) {
            scheduleDoc = new Schedule({
                className,
                teacherName: teacherName || 'Non spécifié',
                subject: subject || '',
                schedule: schedule || {}
            });
        } else {
            if (teacherName) scheduleDoc.teacherName = teacherName;
            if (subject) scheduleDoc.subject = subject;
            if (schedule) {
                scheduleDoc.schedule = { ...scheduleDoc.schedule, ...schedule };
            }
        }

        scheduleDoc.updatedAt = new Date();
        const savedSchedule = await scheduleDoc.save();
        res.json(savedSchedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/schedules/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Non trouvé' });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/schedules/:id', async (req, res) => {
    try {
        const updatedSchedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        if (!updatedSchedule) {
            return res.status(404).json({ message: 'Non trouvé' });
        }
        res.json(updatedSchedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/schedules/cell', async (req, res) => {
    try {
        const { className, day, hour } = req.body;

        if (!className || !day || !hour) {
            return res.status(400).json({ message: 'className, day et hour sont requis' });
        }

        const unsetPath = `schedule.${day}.${hour}`;
        
        const updatedSchedule = await Schedule.findOneAndUpdate(
            { className: className },
            { $unset: { [unsetPath]: "" } },
            { new: true }
        );

        if (!updatedSchedule) {
            return res.status(404).json({ message: 'Classe non trouvée' });
        }

        updatedSchedule.updatedAt = new Date();
        await updatedSchedule.save();

        res.json({ message: 'Créneau supprimé avec succès', data: updatedSchedule });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/schedules/:id', async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Supprimé avec succès' });
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
