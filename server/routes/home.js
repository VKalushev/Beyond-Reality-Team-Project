const express = require('express');
const router = express.Router();
const authCheck = require('./../auth')

// Get projects list
// TODO: Actually implement, this is an example of an authenticated area.
router.get("/", authCheck, async (req, res) => {
    res.json({user: req.username});
});

module.exports = router;