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

const PORT = 31234;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Press Ctrl+C to stop');
});
