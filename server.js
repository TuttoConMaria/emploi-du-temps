
const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI || "mongodb+srv://tuttoconmaria_db_user:pass1234@cluster0.fruilcf.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db, schedulesCollection;

async function startServer() {
    try {
        await client.connect();
        db = client.db("tuttoconmaria_db");
        schedulesCollection = db.collection("schedules");
        console.log("Connecté à MongoDB Atlas avec succès !");
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    } catch (err) {
        console.error("Erreur de connexion à MongoDB :", err);
    }
}

startServer();

app.use(express.json());
app.use(express.static(__dirname));

// Récupérer les emplois du temps depuis MongoDB
app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await schedulesCollection.find({}).toArray();
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la lecture des données" });
    }
});

// Enregistrer un nouvel emploi du temps dans MongoDB
app.post('/api/schedules', async (req, res) => {
    try {
        const newSchedule = req.body;
        await schedulesCollection.updateOne(
            { className: newSchedule.className },
            { $set: newSchedule },
            { upsert: true }
        );
        res.status(200).json({ message: 'Enregistré dans MongoDB avec succès !' });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'enregistrement" });
    }
});

// Réinitialiser les données
app.delete('/api/schedules', async (req, res) => {
    try {
        await schedulesCollection.deleteMany({});
        res.status(200).json({ message: 'Données effacées de MongoDB.' });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
});
