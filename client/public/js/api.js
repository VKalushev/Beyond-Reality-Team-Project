const API_URL = "http://127.0.0.1:8000";

async function login(username, password) {
    let res = await fetch(API_URL + "/login", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({username: username, password: password}),
    });

    // TODO: Error handling is likely a good idea
    return res.json();
}

// Check the token, returns whether or not its valid, if it is also comes with a refreshed token
async function checkToken(token) {
    let res = await fetch(API_URL + "/login", {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            'Authorization': 'Bearer ' + token
        }
    });

    return await res.json();
}

async function getProjects(token) {
    let res = await fetch(API_URL + "/projects", {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            'Authorization': 'Bearer ' + token
        }
    });
    console.log(res);
    // TODO: Error handling is likely a good idea

    return await res.json();
}

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

