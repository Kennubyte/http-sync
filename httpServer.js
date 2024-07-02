const express = require("express");

const httpServer = class {
    constructor() {
        this.listenerMap = new Map();
        this.app = express();
        this.socket = null;

        this.app.get('/*', async (req, res) => {
            const port = req.socket.localPort;
            this.socket.emit(`publicRequest`, { path: req.originalUrl, port });

            try {
                const data = await new Promise((resolve, reject) => {
                    this.socket.once(`publicResponse`, resolve);
                    setTimeout(() => reject(new Error("Public response timed out.")), 500);
                });

                if (data.port === port && data.path === req.originalUrl) {
                    const returnData = Buffer.from(data.body, 'base64').toString('utf8');
                    return res.send(returnData);
                }
            } catch (error) {
                console.error(error);
                return res.status(500).send(`ERROR: ${error.message}`);
            }
        });
    }

    setSocket(socket) {
        this.socket = socket;
    }

    addWebListener(port) {
        console.log(`Adding web listener on port ${port}`);
        try {
            const server = this.app.listen(port, () => {
                console.log(`Server is running on http://localhost:${port}`);
                this.listenerMap.set(port, server);
            });
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    removeWebListener(port) {
        console.log(`Removing web listener on port ${port}`);
        if (this.listenerMap.has(port)) {
            const server = this.listenerMap.get(port);
            server.close(() => {
                console.log(`Server on port ${port} is now closed`);
                this.listenerMap.delete(port);
            });
        } else {
            console.log(`No web listener found on port ${port}`);
        }
    }
};

module.exports = new httpServer();