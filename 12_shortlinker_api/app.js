const express = require('express');
const { MongoClient } = require('mongodb');
const shortid = require('shortid');
const URL = require("url").URL;

const app = express();
const port = 3000;

const url = process.env.MONGODB_CONNECTION_URL;
const dbName = process.env.MONGODB_DATABASE_NAME;

async function connectToDatabase() {
    try {
        const client = await MongoClient.connect(url);
        return client.db(dbName);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

app.use(express.json());

app.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;

    const stringIsAValidUrl = (s) => {
        try {
            new URL(s);
            return true;
        } catch (err) {
            return false;
        }
    };

    if (!stringIsAValidUrl(originalUrl)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        const db = await connectToDatabase();

        const collection = db.collection('links');
        const existingLink = await collection.findOne({ originalUrl })

        if (existingLink) {
            const shortenedUrl = `http://localhost:3000/${existingLink.shortUrl}`;
            return res.json({ shortenedUrl });
        }

        const shortId = shortid.generate();

        const newLink = {
            originalUrl,
            shortUrl: shortId,
        };

        await collection.insertOne(newLink);

        const shortenedUrl = `http://localhost:3000/${shortId}`;
        res.json({ shortenedUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;

    try {
        const db = await connectToDatabase();
        const collection = db.collection('links');

        const link = await collection.findOne({ shortUrl });

        if (link) {
            res.redirect(link.originalUrl);
        } else {
            res.status(404).json({ error: 'Link not found' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
