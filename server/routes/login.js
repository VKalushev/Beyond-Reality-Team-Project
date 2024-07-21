require('dotenv').config()

const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const jwt = require('jsonwebtoken');
const authCheck = require('./../auth')

function generateAccessToken(username) {
    return jwt.sign({username}, process.env.TOKEN_SECRET, { expiresIn: "30m" });
}

router.get("/", async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Drop the 'Bearer' part
    if (token === null)
        return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err);
            res.json({valid: false});
            return;
        }
        res.json({valid: true, token: generateAccessToken(user.username)});
    });
})

router.post("/", async (req, res) => {
    const db = getDb();
    // console.log(req.body);
    let username = req.body.username;
	let password = req.body.password;

    if(username && password) {
        const findQuery = db.collection('projectOwners').findOne({username: username});
        const user = await findQuery.then(result => {return result});
        // console.log(user);

        if(user !== null){
            if(password === user.password){
                console.log("Yess");
                res.json({successful: true, token: generateAccessToken(user.username)});
            } else {
                res.json({successful: false});
            }
        } else {
            res.json({successful: false});
        }
    } else {
        res.json({successful: false, error: 'Invalid request'});
    }
});

module.exports = router;