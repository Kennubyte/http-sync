class httpClient {
    async getPublicIPAddress() {
        let ip1
        let ip2
        //fetch public IP address from ipify.org
        await fetch("https://api.ipify.org?format=json")
            .then(async (response) => {
                response = await response.json()
                ip1 = response.ip
            })
            .catch(function (err) {
                console.log("Unable to fetch -", err);
            });


        // then, fetch public IP address from seeip.org
        await fetch("https://api.seeip.org/jsonip?")
            .then(async (response) => {
                response = await response.json()
                ip2 = response.ip
            })
            .catch(function (err) {
                console.log("Unable to fetch -", err);
            });

        // When done, compare the results.
        if (ip1 === ip2) {
            return { success: true, ip: ip1 }
        } else {
            console.log("Error, Unreliable ip detected. Please use Ngrok instead.")
            return { success: false }
        }
    }


    async makeLocalRequest(port, path){
        await fetch("http://localhost:" + port + "/" + path)
            .then(async (response) => {
                return await response.text()
            })
            .catch(function (err) {
                console.log("Unable to fetch -", err);
            });
    }
}

module.exports = new httpClient();