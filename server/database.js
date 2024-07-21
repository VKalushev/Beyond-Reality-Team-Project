/*
 * Make it so the connected database can be accessed in any JS file
 */

var db;

function connectDb(mdb) {
    db = mdb;
}

function getDb() {
    return db;
}

module.exports.connectDb = connectDb;
module.exports.getDb = getDb;