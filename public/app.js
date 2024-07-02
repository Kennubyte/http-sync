document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript is working!');
    getState()
});
getAndSetPorts()
getAndSetNetworkPorts()

function _setFieldsToDisabled(bool){
    const id = document.getElementById('connectID')
    const password = document.getElementById('connectPassword')

    id.disabled = bool
    password.disabled = bool
}

function _setStatusPill(state){
    const pill = document.getElementById('statusPill')
    const classesToKeep = ['badge', 'rounded-pill'];

    switch (state) {
        case "disconnected":
            pill.innerHTML = 'Disconnected'
            for (let i = pill.classList.length - 1; i >= 0; i--) {
                const className = pill.classList[i];
                if (!classesToKeep.includes(className)) {
                    pill.classList.remove(className);
                }
            }
            pill.classList.add("text-bg-danger");
            document.getElementById('hostingStopButton').disabled = true
            document.getElementById('hostDirectly').disabled = false
            document.getElementById('hostNgrok').disabled = false
            document.getElementById('connectToServer').disabled = false
            _setFieldsToDisabled(false)

            break;
        case "hosting":
            pill.innerHTML = 'Hosting'
            for (let i = pill.classList.length - 1; i >= 0; i--) {
                const className = pill.classList[i];
                if (!classesToKeep.includes(className)) {
                    pill.classList.remove(className);
                }
            }
            document.getElementById('hostingStopButton').disabled = false
            pill.classList.add("text-bg-info");

            document.getElementById('hostDirectly').disabled = true
            document.getElementById('hostNgrok').disabled = true
            document.getElementById('connectToServer').disabled = true
            _setFieldsToDisabled(true)

            break;
        case "connected":
            pill.innerHTML = 'Connected'
            for (let i = pill.classList.length - 1; i >= 0; i--) {
                const className = pill.classList[i];
                if (!classesToKeep.includes(className)) {
                    pill.classList.remove(className);
                }
            }
            pill.classList.add("text-bg-success");
            document.getElementById('hostingStopButton').disabled = false
            document.getElementById('hostDirectly').disabled = true
            document.getElementById('hostNgrok').disabled = true
            document.getElementById('connectToServer').disabled = true
            _setFieldsToDisabled(true)

            break;
        case "thinking":
            pill.innerHTML = 'Thinking'
            for (let i = pill.classList.length - 1; i >= 0; i--) {
                const className = pill.classList[i];
                if (!classesToKeep.includes(className)) {
                    pill.classList.remove(className);
                }
            }
            pill.classList.add("text-bg-warning");
            document.getElementById('hostDirectly').disabled = true
            document.getElementById('hostNgrok').disabled = true
            document.getElementById('connectToServer').disabled = true
            _setFieldsToDisabled(true)

            break;
    
        default:
            pill.innerHTML = 'Disconnected'
            for (let i = pill.classList.length - 1; i >= 0; i--) {
                const className = pill.classList[i];
                if (!classesToKeep.includes(className)) {
                    pill.classList.remove(className);
                }
            }
            pill.classList.add("text-bg-danger");
            document.getElementById('hostingStopButton').disabled = true
            document.getElementById('hostDirectly').disabled = false
            document.getElementById('hostNgrok').disabled = false
            document.getElementById('connectToServer').disabled = false
            _setFieldsToDisabled(false)


            break;
    }
}



function hostDirectly() {
    const id = document.getElementById('connectID')
    const password = document.getElementById('connectPassword')
    _setFieldsToDisabled(true)
    _setStatusPill("thinking")
    const url = '/api/serveDirect';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(async response => {
        const json = await response.json();
        console.log(json);
        _setStatusPill("hosting")
        id.value = json.cID;
        password.value = json.password;
    })
    .catch(error => {
        console.error('Error:', error)
        _setFieldsToDisabled(false)
        _setStatusPill("disconnected")
    });
}


function hostWithNgrok() {
    const id = document.getElementById('connectID')
    const password = document.getElementById('connectPassword')
    _setFieldsToDisabled(true)
    _setStatusPill("thinking")
    const url = '/api/serveNgrok';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(async response => {
        const json = await response.json();
        console.log(json);
        _setStatusPill("hosting")
        id.value = json.cID;
        password.value = json.password;
    })
    .catch(error => {
        console.error('Error:', error)
        _setFieldsToDisabled(false)
        _setStatusPill("disconnected")
    });
}


function stopHosting(){
    console.log("Stopping hosting!")
    _setStatusPill("thinking")
    const url = '/api/stopServing';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
        console.log("done!")
        _setFieldsToDisabled(false)
        _setStatusPill("disconnected")
        document.getElementById('connectID').value = ""
        document.getElementById('connectPassword').value = ""
    })
}

function connect() {
    _setStatusPill("thinking")
    const id = document.getElementById('connectID')
    const password = document.getElementById('connectPassword')
    const data = {
        id: id.value,
        password: password.value
    }
    if (data.id == "" || data.password == ""){
        alert("Connection ID and Password are required.")
        _setStatusPill("disconnected")
        _setFieldsToDisabled(false)
        return
    }

    const url = '/api/connect';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cID: data.id,
            password: data.password
        })
    })
    .then(async response => {
        const data = await response.json()
        console.log("done!")
        console.log(data)
        if (data.success === true){
            _setStatusPill("connected")
        }
    })
}



function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
}

function updateLocalList(list){
    const localList = document.getElementById('syncLocalList')
    localList.innerHTML = ""
    list.forEach(element => {
        newElement = document.createElement('div')
        newElement.className = 'input-group mb-3'
        neInput = document.createElement('input')
        neInput.value = element
        neInput.className = 'form-control'
        neInput.disabled = true
        neInput.type = "text"

        neButton = document.createElement('button')
        neButton.type = "button"
        neButton.className = 'btn btn-sm btn-outline-danger'
        neButton.innerHTML = '<i class="bi bi-trash"></i>'
        neButton.addEventListener("click", function() {
            removePortFromLocalSync(element);
        });        
 
        newElement.appendChild(neInput)
        newElement.appendChild(neButton)
        localList.appendChild(newElement)
    });

    var addElement = document.createElement('div');
    addElement.className = 'input-group mt-3';
    var inputElement = document.createElement('input');
    inputElement.type = 'number';
    inputElement.className = 'form-control';
    inputElement.placeholder = 'Port';
    inputElement.setAttribute('aria-label', 'Port');
    inputElement.onkeypress = function(event) {
        return isNumberKey(event);
    };
    var buttonElement = document.createElement('button');
    buttonElement.type = 'button';
    buttonElement.className = 'btn btn-sm btn-outline-primary';
    buttonElement.innerHTML = '<i class="bi bi-plus-circle"></i>';
    buttonElement.addEventListener("click", function() {
        addPortFromLocalSync(inputElement.value);
    });

    addElement.appendChild(inputElement);
    addElement.appendChild(buttonElement);

    localList.appendChild(addElement)
}



function updateNetworkList(list){
    const NetworkList = document.getElementById('syncedPortList')
    NetworkList.innerHTML = ""
    list.forEach(element => {
        newElement = document.createElement('div')
        newElement.className = 'input-group mb-3'
        neInput = document.createElement('input')
        neInput.value = element
        neInput.className = 'form-control'
        neInput.disabled = true
        neInput.type = "text"
        neInput.value = element
 
        newElement.appendChild(neInput)
        NetworkList.appendChild(newElement)
    });
}


function removePortFromLocalSync(portNumber){
    console.log(portNumber)
    const url = '/api/removePort';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            port: portNumber,
        })
    })
    .then(async response => {
        const data = await response.text()
        console.log("done!")
        console.log(data)
        getAndSetPorts()
    })
}

function addPortFromLocalSync(portNumber){
    console.log(portNumber)
    const url = '/api/addPort';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            port: portNumber,
        })
    })
    .then(async response => {
        const data = await response.text()
        console.log("done!")
        console.log(data)
        getAndSetPorts()
    })
}


function getAndSetPorts(){
    const url = '/api/getPorts';

    fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/text' },
    })
    .then(async response => {
        const data = await response.text()
        updateLocalList(JSON.parse(data))
    })
}


function getAndSetNetworkPorts(){
    const url = '/api/getNetworkPorts';

    fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/text' },
    })
    .then(async response => {
        const data = await response.text()
        updateNetworkList(JSON.parse(data))
    })
}


function setNgrokToken() {
    const token = document.getElementById('ngrokTokenField').value
    console.log(token)
    const url = '/api/setNgrokToken';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: token,
        })
    })
    .then(async response => {
        const text = await response.text()
        alert(text)
    })
}


function getState() {
    const url = '/api/getState';
    fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/text' },
    })
    .then(async response => {
        const text = await response.text()
        console.log(text)
        _setStatusPill(text)
    })
}

setInterval(() => {
    getAndSetNetworkPorts()
}, 1000);