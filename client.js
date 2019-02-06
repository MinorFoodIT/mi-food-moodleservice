const axios = require('axios');
var config = require('./config/config')

const sql = require('mssql')

axios.defaults.baseURL = 'https://learning.minorfood.com';
axios.defaults.headers.post['Content-Type'] = 'application/json';


// Create connection to database
var dbconfig = {
    user: config.user, // update me
    password: config.password ,// update me
    server: config.server,
    database: config.database,
    driver: 'msnodesql',
    options: {
        trustedConnection: true
    },
    connectionString: "Driver={SQL Server Native Client 11.0};Server=#{server}\\sql;Database=#{database};Uid=#{user};Pwd=#{password};"

}
//var connection = new Connection(dbconfig);

sql.connect(dbconfig).then(pool => {
    // Query

    return pool.request()
        //.input('input_parameter', sql.Int, value)
        .query('select * from xx_moodle_core_course_get_categories ')
}).then(result => {
    console.dir(result)


}).catch(err => {
    // ... error checks
})

sql.on('error', err => {
    // ... error handler
})

/*
async () => {
    try {
        await sql.connect('mssql://mfgadmin:P@ssw0rd@10.9.5.156/ML_MinorGroup_DEV')
        const result = await sql.query`select * from xx_moodle_core_course_get_categories`
        console.dir(result)
    } catch (err) {
        // ... error checks
    }
}
*/

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