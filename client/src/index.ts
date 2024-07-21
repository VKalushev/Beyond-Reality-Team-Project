import {Vector3} from '@babylonjs/core/Maths/math.vector';

import "@babylonjs/loaders/OBJ";
import "@babylonjs/loaders/gLTF";
import {LoadedProject} from "./project";
import {App} from './app';
import {Gui} from "./gui";

// Copied from api.js because TS doesn't likey
const API_URL = "http://127.0.0.1:8000";
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

// Get the canvas element from the DOM.
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

// Get the project ID from the URL
let paramList = new URLSearchParams(window.location.search);

async function loadProject(): Promise<LoadedProject> {
    if (!paramList.has("id")) {
        // Create a new project.
        console.log("Creating new local project");
        return {
            type: "sea",
            assets: []
        };
    } else {
        // Load a project.
        console.log(paramList.get("id"));

        let res = await fetch(API_URL + "/projects/" + paramList.get("id"), {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Bearer " + getCookie("loginCookie")
            },
        })
        
        return (await res.json()).project as LoadedProject;

        // project = {
        //     type: "grass",
        //     assets: [
        //         {
        //             "asset": "ID",
        //             "position": [0, 0, 0]
        //         },
        //         {
        //             "asset": "ID",
        //             "position": [-48, 0, 0]
        //         },
        //         {
        //             "asset": "ID",
        //             "position": [48, 0, 0]
        //         }
        //     ]
        // }
    }
}

loadProject().then(project => {
    let app = new App(canvas, project);
    console.log(app);
    
    let gui = new Gui(app);
});
