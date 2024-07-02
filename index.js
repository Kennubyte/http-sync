const server = require('./server');
const clientObj = require('./client');
const bodyParser = require('body-parser')
const httpClient = require('./httpClient');
const express = require('express');
const path = require('path');
const app = express();
console.clear();
const ports = []

const client = new clientObj(ports)


let state = "disconnected";

function isLoopbackAddress(ip) {
    return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
}

app.use(bodyParser.json())


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

    await client.connectToServer(encodedIP, data.password);
    state = "hosting"
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

    await client.connectToServer(encodedIP, data.password);
    state = "hosting"
    res.json(responseData)
});


app.post('/api/stopServing', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }
    console.log('Stopping server');
    client.disconnect()
    server.stopWebSocketServer();
    state = "disconnected"
    return res.status(200).send("OK");
});


app.post('/api/setNgrokToken', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }
    await server.setNgrokToken(req.body.token)
    return res.status(200).send("Token set successfully, (Doesn't mean its a valid token, its just set successfully!)");
});


app.post('/api/connect', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }

    const { cID, password } = req.body;

    if (!cID || !password) {
        return res.status(400).send('cID, password, and server are required');
    }

    try {
        ports.forEach(port => {
            client.portPool.add(port);
        })
        const returnData = await client.connectToServer(cID, password);
        if (returnData.success === true) {
            state = "connected"
        }
        return res.status(200).json(returnData);
    } catch (error) {
        console.error('Error connecting to server:', error);
        return res.status(500).send('Error connecting to server');
    }
});



app.post('/api/addPort', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }

    function isValidNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    const port = parseFloat(req.body.port);

    if (!isValidNumber(port)) {
        console.log("Invalid port type.");
        return res.status(400).send('Invalid port type');
    }

    console.log("Adding port: " + port);
    client.addPort(port);
    ports.push(port);

    return res.status(200).send("OK");
});



app.post('/api/removePort', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }
    console.log("removing port: " + req.body.port)
    const index = ports.indexOf(req.body.port);
    if (index > -1) {
        ports.splice(index, 1);
        client.removePort(req.body.port);
    } else {
        console.log("Port not found: " + req.body.port)
    }


    return res.status(200).send("OK");
});


app.get('/api/getState', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }
    return res.status(200).send(state);
});

app.get('/api/getPorts', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }

    return res.status(200).send(ports);
});


app.get('/api/getNetworkPorts', async (req, res) => {
    const clientIP = req.ip;
    if (!isLoopbackAddress(clientIP)) {
        return res.status(403).send('Forbidden');
    }
    return res.status(200).send(client.getnetworkPorts());
});



app.get('/*', (req, res) => {
    var file = req.params[0] ? req.params[0] : 'index.html';
    const clientIP = req.ip;

    if (isLoopbackAddress(clientIP)) {
        res.sendFile(path.join(__dirname, 'public', file))
    } else {
        res.status(403).send('Forbidden');
    }
});

// the "Errorcatcher 9000"
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});

const PORT = 31234;
app.listen(PORT, async () => {
    console.log(`WebUI is running on port ${PORT}`);
});
