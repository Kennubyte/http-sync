document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript is working!');
});


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
    const id = document.getElementById('connectID')
    const password = document.getElementById('connectPassword')
    const data = {
        id: id.value,
        password: password.value
    }



    console.log(data);
}