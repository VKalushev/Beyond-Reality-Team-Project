require('dotenv').config()

const express = require('express');
const router = express.Router();
const authCheck = require('./../auth')
const { getDb } = require('../database');
const { ObjectID } = require("mongodb");

// Get projects list
// TODO: Actually implement, this is an example of an authenticated area.
router.get("/", authCheck, async (req, res) => {
    console.log("abv")
    const db = getDb();

    let username = req.username;

    const findQuery = db.collection('projectOwners').findOne({ username: username });
    const user = await findQuery.then(result => { return result });


    getUserProjects(username).then(userProjects => {
        console.log(userProjects);
        res.json({ projects: userProjects });
    }).catch(err => {
        // TODO: Error
        res.json({error: true});
    })

});

async function getUserProjects(username) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.collection("projects").find({}).toArray(function (err, result) {
            if (err) {
                reject(err);
                return;
            }

            let projects = [];

            for (const projectNum in result) {
                for (const user in result[projectNum].users) {
                    if(result[projectNum].users[user] === username){
                        let proj = result[projectNum];
                        projects.push({id: proj._id, name: proj.name, type: proj.type});
                    }
                }
            }

            resolve(projects);
        });
    })
}

router.get("/:id", authCheck, async (req, res) => {
    console.log("abv")
    const db = getDb();

    let username = req.username;
    let projectId = req.params.id;

    db.collection("projects").find({users: username, _id: new ObjectID(projectId)}).toArray(function (err, result) {
        if (err) {
        
            res.json({error: true});
            return;
        }

        if (result.length > 0) {
            res.json({ project: result[0] });
        } else {
            res.json({error: true})
        }
    });

});

router.post("/", async (req, res) => {
    const db = getDb();
    let username = req.body.username;
    let projectName = req.body.projectName;

    db.collection("projects").insertOne({ "name": projectName, "users": [username], "assets": [] }, (err, res) => {
        if (err) throw err;
    });

    res.json({successful: true});
});

module.exports = router;