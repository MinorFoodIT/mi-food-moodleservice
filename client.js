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

/*
const pools = new sql.ConnectionPool(dbconfig, err => {
    if(err) console.log('SQL : Create Pools : error '+err)

});

pools.on('error', err => {
    console.log('SQL : Pools : error '+err)
    throw err
})
*/
/*
pools.then( pool => {
        pool.request() // or: new sql.Request(pool)
            .input('id', sql.Int, course.id)
            .query('insert into xx_moodle_core_course_get_categories(id) valuse(@id)')
    }
);
*/

function insertTable_CourseCategories(course ,pool){

    return pool.request()
        .input('id', sql.Int, course.id)
        .input('name', sql.NVarChar(255), course.name)
        .input('idnumber', sql.NVarChar(255), course.idnumber)
        .input('description', sql.NVarChar(255), course.description)
        .input('descriptionformat', sql.int, course.descriptionformat)
        .input('parent', sql.int, course.parent)
        .input('sortorder', sql.int, course.sortorder)
        .input('coursecount', sql.int, course.coursecount)
        .input('visible', sql.int, course.visible)
        .input('visibleold', sql.int, course.visibleold)
        .input('timemodified', sql.int, course.timemodified)
        .input('depth', sql.int, course.depth)
        .input('path', sql.NVarChar(1000), course.path)


        .query('Insert into xx_Moodle_CourseCategories (id,name,idnumber,description,descriptionformat,parent,sortorder,coursecount,visible,visibleold,timemodified,depth,path) ' +
            'values (@id,@name,@idnumber,@description,@descriptionformat,@parent,@sortorder,@coursecount,@visible,@visibleold,@timemodified,@depth,@path)')
        .then(result => {
            console.dir(result)
        })
}

sql.connect(config).then(pool => {

    axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_course_get_categories&moodlewsrestformat=json&criteria[0][key]=parent&criteria[0][value]=0')
        .then(function (response) {
            var course_data = response.data;
            for (const course of course_data) {

                console.log(course.id);
                insertTable(course,pool)
                /*
                pool.request()
                    .input('id', sql.Int, course.id)
                    .query('Insert into xx_moodle_core_course_get_categories (id) values (@id)')
                    .then(result => {
                        console.dir(result)
                    })
                */

            }

        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });

}).catch(err =>{
    console.info('SQL Connect error '+err)
})

