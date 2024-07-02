const { io } = require("socket.io-client");
const httpServer = require("./httpServer");
const httpClient = require("./httpClient");

class Client {
    constructor(localPorts) {
        this.ports = localPorts;
        this.socket = null;
        this.portPool = new Set();
        this.localPorts = new Set();
        
    }

    getnetworkPorts(){
        let tempArray = []
        this.portPool.forEach(port => {
            if (!this.localPorts.has(port)){
                tempArray.push(port)
            }
        })
        return tempArray;
    }

    async addPort(port){
        this.localPorts.add(port);
        this.portPool.add(port);
        this.portPool.forEach(port => {
            this.socket.emit('addPortToMainPool', port)
        })
    }

    async removePort(port){
        this.localPorts.delete(port);
        this.portPool.delete(port);
        this.socket.emit('removePortFromMainPool', port)
    }

    async connectToServer(cID, password) {
        console.log(`Connecting to server with client ID: ${cID} and password: ${password}`);
        const decodedDest = Buffer.from(cID, 'base64').toString('utf8');
        
        return new Promise((resolve, reject) => {
            let socket;
    
            if (decodedDest.includes('ngrok')) {
                console.log("Ngrok url detected");
                socket = io(decodedDest);
            } else {
                socket = io('http://' + decodedDest + ':31235');
            }
    
            socket.on('connect', () => {
                console.log('Connected to Socket.IO server');
                setTimeout(() => {
                    socket.emit('auth', {password: password});
                    console.log('Sent authentication');
                }, 250);
            });
    
            socket.on('authenticated', () => {
                console.log('Authentication successful');
                httpServer.setSocket(socket)
                this.portPool.forEach(port => {
                    socket.emit('addPortToMainPool', port)
                })
                resolve({ success: true, password: password, cID: cID });
            })

            socket.on('addPortToMainPool', (port) => {
                console.log('Adding port: ' + port + ' to main pool.');
                this.portPool.add(port);
                httpServer.addWebListener(port)
            })

            socket.on('removePortFromMainPool', (port) => {
                console.log('deleting port: ' + port + ' from main pool.');
                this.portPool.delete(port);
                httpServer.removeWebListener(port)
            })

            socket.on('publicRequest', async (request) => {
                console.log('Checking if request is for us.');
                if (this.localPorts.has(request.port)){
                    console.log("Shit, scramble! this is for us!")
                    const data = await httpClient.makeLocalRequest(request.port, request.path)
                    const encodedData = Buffer.from(data).toString('base64')
                    this.socket.emit(`publicResponse`, {body: encodedData, port: request.port, path: request.path})
                }
            })

    
            socket.on('connect_error', (err) => {
                console.error('Connection error, If you are hosting. check if you are port forwarded on port 31235:', err.message);
                reject(new Error('Connection error'));
            });
    
            socket.on('error', (err) => {
                console.error('Socket error:', err.message);
                reject(new Error('Socket error'));
            });




    
            // Assign this.socket to the connected socket
            this.socket = socket;
        });
    }
    
    disconnect() {
        this.socket.disconnect();
    }
}

module.exports = Client;
