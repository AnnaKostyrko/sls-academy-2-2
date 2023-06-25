const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

const url = process.env.MONGODB_CONNECTION_URL;
const dbName = process.env.MONGODB_DATABASE_NAME;

app.use(express.json());

async function connectToDatabase() {
    try {
        const client = await MongoClient.connect(url);
        return client.db(dbName);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

app.put('/:json_path', async (req, res) => {
    const jsonPath = req.params.json_path;
    const jsonDocument = req.body;

    try {
        const db = await connectToDatabase();

        const collection = db.collection('documents');
        await collection.updateOne({ path: jsonPath }, { $set: { document: jsonDocument } }, { upsert: true });

        res.status(200).send('JSON document stored successfully');
    } catch (error) {
        console.error('Failed to store JSON document:', error);
        res.status(500).send('Failed to store JSON document');
    }
});

app.get('/:json_path', async (req, res) => {
    const jsonPath = req.params.json_path;

    try {
        const db = await connectToDatabase();

        const collection = db.collection('documents');
        const result = await collection.findOne({ path: jsonPath });

        if (!result) {
            res.status(404).send('JSON document not found');
        } else {
            res.status(200).json(result.document);
        }
    } catch (error) {
        console.error('Failed to retrieve JSON document:', error);
        res.status(500).send('Failed to retrieve JSON document');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
