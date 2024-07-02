const express = require("express");

class httpServer {
    constructor(){
        this.listenerMap = new Map(); // Using Map to store listeners by port
        this.app = express();
        this.socket = null

        // Middleware to handle all GET requests
        this.app.get('/*', (req, res) => {
            const port = req.socket.localPort
            this.socket.emit(`publicRequest`, {path: req.originalUrl, port: port})
            this.socket.once(`publicResponse`, (data) => {
                console.log(data)
                const timeoutTimer = setTimeout(() => {
                    console.log("Public response timed out.")
                    return res.send(`ERROR: No response.`);
                }, 2000);

                console.log(data)
                if (data.port == port && data.path == req.originalUrl){
                    clearTimeout(timeoutTimer);
                    console.log(data)
                    const returnData = Buffer.from(data.body, 'base64').toString('utf8')
                    return res.send(returnData);
                }
            })
        });
    }

    setSocket(socket){
        this.socket = socket
    }

    addWebListener(port){
        console.log("Adding web listener on port " + port);
        try{
            const server = this.app.listen(port, () => {
                console.log(`Server is running on http://localhost:${port}`);
                this.listenerMap.set(port, server); // Store server instance by port
            });
        }catch(e){
            console.log("Error: " + e)
        }
    }

    removeWebListener(port){
        console.log("Removing web listener on port " + port);
        if (this.listenerMap.has(port)) {
            const server = this.listenerMap.get(port);
            server.close(() => {
                console.log(`Server on port ${port} is now closed`);
                this.listenerMap.delete(port); // Remove from map after closing
            });
        } else {
            console.log(`No web listener found on port ${port}`);
        }
    }
}

module.exports = new httpServer();
