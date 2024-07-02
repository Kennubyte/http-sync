const httpClient = class {
    async getPublicIPAddress() {
        try {
            const [ipifyResponse, seeipResponse] = await Promise.all([
                fetch("https://api.ipify.org?format=json"),
                fetch("https://api.seeip.org/jsonip?"),
            ]);

            const ip1 = (await ipifyResponse.json()).ip;
            const ip2 = (await seeipResponse.json()).ip;

            if (ip1 === ip2) {
                return { success: true, ip: ip1 };
            } else {
                console.log("Error, Unreliable IP detected. Please use Ngrok instead.");
                return { success: false };
            }
        } catch (err) {
            console.error("Unable to fetch -", err);
            return { success: false };
        }
    }

    async makeLocalRequest(port, path) {
        try {
            const response = await fetch(`http://localhost:${port}${path}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (err) {
            console.error("Unable to fetch -", err);
            throw err; // Propagate the error so it can be handled by the caller
        }
    }
};

module.exports = new httpClient();