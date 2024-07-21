// console.log("Test1")
const express = require('express');
const app = express();
const path = require('path')
const dotenv = require('dotenv');
const { MongoClient } = require("mongodb");
const MongoStore = require('connect-mongo');
const router = express.Router();
var cors = require("cors");

const { connectDb, getDb } = require("./database");
dotenv.config();

if (process.env.TOKEN_SECRET === undefined) {
    console.error("JWT Token Missing!");
    process.exit(-1);
}

let mdb;

/* App Properties */
// Port must be different to the client server.
const port = 8000;

app.use(cors());

/* Database Setup */
// const url = "mongodb+srv://beyondReality1:bestpassword@main.ef79t9g.mongodb.net/?retryWrites=true&w=majority";
const url = "mongodb+srv://breality:breality@cluster0.gadbuqx.mongodb.net/?retryWrites=true&w=majority";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes:
const loginRouter = require('./routes/login');
const projectsRouter = require('./routes/projects');
const homeRouter = require('./routes/home');
const assetsRouter = require('./routes/assets');

//add the router
app.use('/login', loginRouter);
app.use('/projects', projectsRouter);
app.use('/', homeRouter);
app.use('/assets', assetsRouter);

// Connect to MongoDB
MongoClient.connect(url, (err, client) => {
    if (err) throw err;
    console.log("Database connected.");
    mdb = client.db('beyondReality');
    connectDb(mdb);

    // // Add in a test collection
    // let test = mdb.collection("Test").find({ "name": "Testche" }).toArray((err, result) => {
    //     if (result.length == 0) {
    //         mdb.collection("projectOwners").insertOne({ "username": "owner1", "password": "test" }, (err, res) => {
    //             if (err) throw err;
    //             // console.log("document inserted into test");
    //         });
    //     }
    // });

    // Start the app
    app.listen(port, startApp);
});

function startApp() {
    console.log("Project Toolbox Backend is running at http://127.0.0.1:" + port);
}
