// external packages
const axios = require('axios');
const express = require('express');
require('dotenv').config();

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(express.urlencoded({ extended: true }));
webApp.use(express.json());
webApp.use((req, res, next) => {
    console.log(`Path ${req.path} with Method ${req.method}`);
    next();
});

// Server Port
const PORT = process.env.PORT || 5000;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});


const homeRoute = require('./routes/homeRoute');
const dialogflowRoute = require('./routes/dialogflowRoute');

webApp.use('/', homeRoute.router);
webApp.use('/dialogflow', dialogflowRoute.router);


// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});