const crypto = require('crypto');
const httpClient = require('./httpClient');
const ngrok = require('ngrok');
const { Server: SocketServer } = require('socket.io');

class Server {
    constructor() {
        this.port = 31235;
        this.password = "";
        this.portPool = new Set();

        this.io = null;
        this.server = null;
    }

    async setNgrokToken(token) {
        await ngrok.authtoken(token);
        console.log("Successfully set Ngrok token to " + token);
    }

    _generatePassword() {
        const password = crypto.randomBytes(8).toString('hex')
        return password;
    }

    async startWebsocketServerWithNgrok() {
        const password = this._generatePassword();
        this.stopWebSocketServer();
        const url = await ngrok.connect(31235);
        this.startWebSocketServer(password);
        return { url, password };
    }

    async startWebsocketServerDirectly() {
        const password = this._generatePassword();
        this.stopWebSocketServer();

        try {
            const ipData = await httpClient.getPublicIPAddress();
            this.startWebSocketServer(password);
            return { ipData, password };
        } catch (error) {
            console.error('Error getting public IP address:', error);
            throw error;
        }
    }



    async startWebSocketServer(password) {
        this.server = require('http').createServer();
        this.io = new SocketServer(this.server);

        this.server.listen(this.port, () => {
            console.log(`WebSocket server listening on port ${this.port}`);
        });

        const clients = [];

        this.io.on('connection', (socket) => {
            clients.push(socket);
            console.log("Got connection.")
            const authTimeout = setTimeout(() => {
                console.log("Authentication timeout.")
                socket.disconnect();
            }, 5000);

            socket.on('auth', (data) => {
                console.log("Authenticating...")
                if (data.password === password) {
                    console.log("Authenticated.")
                    socket.emit('authenticated');
                    clearTimeout(authTimeout);
                    this.portPool.forEach((port) => {
                        socket.emit('addPortToMainPool', port)
                    })
                }
            });

            
            socket.on('publicRequest', (message) => {
                console.log("Message received")
                clients.forEach((client) => {
                    if (client !== socket) {
                        client.emit('publicRequest', message);
                    }
                });
            });


            socket.on('publicResponse', (message) => {
                console.log("Message received")
                clients.forEach((client) => {
                    if (client !== socket) {
                        client.emit('publicResponse', message);
                    }
                });
            });


            socket.on('addPortToMainPool', (port) => {
                console.log('Broadcasting port to clients: ' + port);
                this.portPool.add(port);
                clients.forEach((client) => {
                    if (client !== socket) {
                        client.emit('addPortToMainPool', port);
                    }
                });
            })

            socket.on('removePortFromMainPool', (port) => {
                console.log('Broadcasting port to clients: ' + port);
                this.portPool.delete(port);
                clients.forEach((client) => {
                    if (client !== socket) {
                        client.emit('removePortFromMainPool', port);
                    }
                });
            })

            socket.on('disconnect', () => {
                clients.splice(clients.indexOf(socket), 1);
            });
        });
    }

    stopWebSocketServer() {
        ngrok.disconnect();
        if (this.server) {
            this.server.close((err) => {
                console.log('WebSocket server stopped');
            });
        } else {
            console.log('WebSocket server was not running');
        }
    }
}

module.exports = new Server();
