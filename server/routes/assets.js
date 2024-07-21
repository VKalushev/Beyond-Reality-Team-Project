require('dotenv').config()

const express = require('express');
const router = express.Router();
const authCheck = require('./../auth')
const { getDb } = require('../database');
const { ObjectID, ObjectId } = require("mongodb");

// Get projects list
// TODO: Actually implement, this is an example of an authenticated area.
router.get("/", authCheck, async (req, res) => {
    res.json({ user: req.username });
});

router.post("/", async (req, res) => {
    const db = getDb();
    // console.log(req.body);

    let assetName = req.body.assetName;
    let assetID = req.body.assetID;
    let assetCost = req.body.assetCost;
    let assetPosition = req.body.position;
    let assembly = null;
    let staff = null;
    let projectID = req.body.projectID

    if (req.body.assetAssembly != undefined) {
        assembly = req.body.assetAssembly;
    }

    if (req.body.staff != undefined) {
        staff = req.body.staff;
    }

    createNewAsset(assetName, assetCost, assembly, staff);
    addAssetToProject(assetName,projectID);

});


async function addAssetToProject(newAsset, projectID) {
    const db = getDb();
    let findAsset = await db.collection('assets').findOne({ name: newAsset }).then(result => { return result });
    let findProject = await db.collection('projects').findOne({ _id: new ObjectId(projectID) }).then(result => { return result });
    // console.log(findProject);
    let assets = findProject.assets;
    assets.push(findAsset);

    await db.collection('projects').updateOne({ _id: new ObjectId(projectID) },
        { $set: { assets: assets } });

}

async function createNewAsset(assetName, assetCost, assembly, staff) {
    const db = getDb();
    db.collection("assets").insertOne({ "name": assetName, "cost": assetCost, 'assembly': assembly, 'staff': staff }, (err, res) => {
        if (err) throw err;
    });
}

async function removeAssetFromProject(assetID, projectID) {
    const db = getDb();
    let findProject = await db.collection('projects').findOne({ _id: new ObjectId(projectID) }).then(result => { return result });
    let arr = findProject.assets;
    for (const i in arr) {
        if (arr[i] == new ObjectId(assetID)) {
            arr.splice(i, 1);
        }
    }

    await db.collection('projects').updateOne({ _id: new ObjectId(projectID) },
        { $set: { assets: arr } });
}


module.exports = router;