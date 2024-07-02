const server = require('./server');
const client = require('./client');
const httpClient = require('./httpClient');
const express = require('express');
const path = require('path');
const app = express();
console.clear();

function isLoopbackAddress(ip) {
    return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
}

app.get('/*', (req, res) => {
    var file = req.params[0] ? req.params[0] : 'index.html';
    const clientIP = req.ip;

    if (isLoopbackAddress(clientIP)) {
        res.sendFile(path.join(__dirname, 'public', file))
    } else {
        res.status(403).send('Forbidden');
    }
});


app.post('/api/serveDirect', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }

    const data = await server.startWebsocketServerDirectly()
    const encodedIP = Buffer.from(data.ipData.ip, 'utf8').toString('base64');

    let responseData = {
        cID: encodedIP,
        password: data.password
    }

    res.json(responseData)
});


app.post('/api/serveNgrok', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }

    const data = await server.startWebsocketServerWithNgrok()
    const encodedIP = Buffer.from(data.url, 'utf8').toString('base64');

    let responseData = {
        cID: encodedIP,
        password: data.password
    }

    res.json(responseData)
});


app.post('/api/stopServing', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }
    console.log('Stopping server');
    server.stopWebSocketServer();

    return res.status(200).send("OK");
});


const PORT = 31234;
app.listen(PORT, async () => {
    console.log(`WebUI is running on port ${PORT}`);
});
