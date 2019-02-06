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
    //driver: 'msnodesql',
    options: {
        trustedConnection: true
    }
    //,connectionString: "Driver={SQL Server Native Client 11.0};Server=#{server}\\sql;Database=#{database};Uid=#{user};Pwd=#{password};"

}
//var connection = new Connection(dbconfig);

const pools = new sql.ConnectionPool(dbconfig, err => {
    if(err) console.log('SQL : Create Pools : error '+err)

    axios.get('/webservice/rest/server.php?wstoken='+config.token+'&wsfunction=core_course_get_categories&moodlewsrestformat=json&criteria[0][key]=parent&criteria[0][value]=0')
        .then(function (response) {
            var course_data = response.data;
            for(const course of course_data){

                console.log(course.id);
                pools.then( pool => {
                        pool.request() // or: new sql.Request(pool)
                            .input('id', sql.Int, course.id)
                            .query('insert into xx_moodle_core_course_get_categories(id) valuse(@id)')
                    }
                );
            }

        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });

});

pools.on('error', err => {
    console.log('SQL : Pools : error '+err)
    throw err
})





/*
sql.connect(dbconfig).then(pool => {
    // Query

    return pool.request()
        .input('input_parameter', sql.VarChar(50), 'CFTH1002')
        .query('select * from Sites where SiteID = @input_parameter')
}).then(result => {
    console.dir(result)


}).catch(err => {
    // ... error checks
})

sql.on('error', err => {
    // ... error handler
})
*/




