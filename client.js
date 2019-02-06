const axios = require('axios');
var config = require('./config/config')

var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

axios.defaults.baseURL = 'https://learning.minorfood.com';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Create connection to database
var dbconfig = {
    authentication: {
        options: {
            userName: config.userName, // update me
            password: config.password // update me
        }
    },
    server: config.server,
    options: {
        database: config.database
    }
}
var connection = new Connection(dbconfig);

// Attempt to connect and execute queries if connection goes through
connection.on('connect', function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected');
    }
});

/*
axios.get('/webservice/rest/server.php?wstoken='+config.token+'&wsfunction=core_course_get_categories&moodlewsrestformat=json&criteria[0][key]=parent&criteria[0][value]=0')
    .then(function (response) {
        // handle success
        console.log(response);
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
    .then(function () {
        // always executed
    });
    */