const express = require('express');
const app = express()
const csv = require('csv-parser');
const fs = require('fs');

async function getClientIP(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

async function ipToInteger(ipAddress) {
    const octets = ipAddress.split('.');
    let integerIP = 0;

    for (let i = 0; i < octets.length; i++) {
        integerIP = (integerIP * 256) + parseInt(octets[i], 10);
    }
    return integerIP;
}

async function readCSVFile() {
    const data = [];

    const parser = csv({headers: false})
    fs.createReadStream('IP2LOCATION-LITE-DB1.CSV').pipe(parser)
    for await (const row of parser) {
        data.push(row)
    }
    return data;
}

app.use(express.json())

app.get('/get-location', async (req, res) => {
    const clientIP = await getClientIP(req);
    const clientIpInteger = await ipToInteger(clientIP)
    const database = await readCSVFile();

    const entry = database.find(
        (row) =>
            clientIpInteger >= row[0] &&
            clientIpInteger <= row[1]
    );

    if (entry) {
        res.send(`Your IP address is ${clientIP} and your country is ${entry[3]}`);
    } else {
        res.status(404).json({ error: 'Location not found' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
