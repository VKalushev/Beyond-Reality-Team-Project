// Just tells the user to login, otherwise the site will be left in an odd state
function loginRedirect() {
    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html" && window.location.pathname !== "/login.html") {
        window.location.pathname = '/login.html';
    }
}

async function onPageLoad() {
    console.log(window.location.pathname);
    if (getCookie("loginCookie") === "") {
        loginRedirect();
    } else {
        let response = await checkToken(getCookie("loginCookie"));
        if (response.valid) {
            if (window.location.pathname === "/login.html") {
                window.location.pathname = "/";
            }

            console.log("Token refreshed!");
            setCookie("loginCookie", response.token);

            // Refresh cookie every 5 mins
            setInterval(async () => {
                let response = await checkToken(getCookie("loginCookie"));
                if (response.valid) {
                    console.log("Token refreshed!");
                    setCookie("loginCookie", response.token);
                } else {
                    alert('Your session has expired, please re-authenticate');
                    loginRedirect();
                }
            }, 5 * 60 * 1000);
        } else {
            loginRedirect();
        }
    }
}

const topNav= document.querySelector (".topnav");
const navToggle = document.querySelector (".mobile-nav-toggle");

navToggle.addEventListener("click", () => {
    const visibility = topNav.getAttribute ('data-visible');

if (visibility === "false") {
    topNav.setAttribute ("data-visible", true);
    navToggle.setAttribute("aria-expanded", true);
    
}   else if (visibility === "true") {
    topNav.setAttribute ("data-visible", false);
    navToggle.setAttribute("aria-expanded", false);
}

console.log (visibility);

});

// async function test() {
//     let res = await fetch(API_URL + "/assets", {
//         method: 'POST',
//         headers: {
//             "Content-Type": "application/json",
//             "Accept": "application/json",
//         },
//         body: JSON.stringify({assetName: "Tanker", assetID: 1218, assetCost: 750000, 
//             assetPostion: "{X: 0.6858552268001903 Y: 11.569028018603351 Z: -51.9339503198879}", assembly: undefined,
//             staff: 100, projectID: "637cccc4ec7a9dc78b833ae3"}),
//     });

//     // TODO: Error handling is likely a good idea
//     return res.json();
// }