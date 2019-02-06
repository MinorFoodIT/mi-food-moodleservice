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

function truncate_table(pool , tablename) {
    return pool.request()
        .query('truncate table '+tablename+'')
        .then(result =>{
            console.log('truncate '+tablename+' complete')
        })
}

function insertTable_CourseCategories(course ,pool){

    return pool.request()
        .input('id', sql.Int, course.id)
        .input('name', sql.NVarChar(255), course.name)
        .input('idnumber', sql.NVarChar(255), course.idnumber)
        .input('description', sql.NVarChar(255), course.description)
        .input('descriptionformat', sql.Int, course.descriptionformat)
        .input('parent', sql.Int, course.parent)
        .input('sortorder', sql.Int, course.sortorder)
        .input('coursecount', sql.Int, course.coursecount)
        .input('visible', sql.Int, course.visible)
        .input('visibleold', sql.Int, course.visibleold)
        .input('timemodified', sql.Int, course.timemodified)
        .input('depth', sql.Int, course.depth)
        .input('path', sql.NVarChar(1000), course.path)


        .query('Insert into xx_Moodle_CourseCategories (id,name,idnumber,description,descriptionformat,parent,sortorder,coursecount,visible,visibleold,timemodified,depth,path) ' +
            'values (@id,@name,@idnumber,@description,@descriptionformat,@parent,@sortorder,@coursecount,@visible,@visibleold,@timemodified,@depth,@path)')
        .then(result => {
            console.dir(result)
        })
}

function insertTable_Courses(course ,pool){

    return pool.request()
        .input('id', sql.Int, course.id)
        .input('shortname', sql.NVarChar(255), course.shortname)
        .input('categoryid', sql.Int, course.categoryid)
        .input('categorysortorder', sql.Int, course.categorysortorder)
        .input('fullname', sql.NVarChar(255), course.fullname)
        .input('displayname', sql.NVarChar(255), course.displayname)
        .input('idnumber', sql.NVarChar(255), course.idnumber)
        .input('startdate', sql.Int, course.startdate)
        .input('enddate', sql.Int, course.enddate)
        .input('visible', sql.Int, course.visible)
        .input('enablecompletion', sql.Int, course.enablecompletion)
        .input('completionnotify', sql.Int, course.completionnotify)

        .query('Insert into xx_Moodle_Courses (id,shortname,categoryid,categorysortorder,fullname,displayname,idnumber,startdate,enddate,visible,enablecompletion,completionnotify) ' +
            'values (@id,@shortname,@categoryid,@categorysortorder,@fullname,@displayname,@idnumber,@startdate,@enddate,@visible,@enablecompletion,@completionnotify)')
        .then(result => {
            console.dir(result)
        })
}
sql.connect(config).then(pool => {

    axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_course_get_categories&moodlewsrestformat=json&criteria[0][key]=parent&criteria[0][value]=0')
        .then(function (response) {
            truncate_table(pool,'xx_Moodle_CourseCategories')
            var course_data = response.data;
            for (const course of course_data) {
                insertTable_CourseCategories(course,pool)
            }
        })
        .catch(function (error) {
            console.log('API : Moodle : core_course_get_categories : error '+error);
        })
        .then(function () {
            // always executed
        });

    axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_course_get_course&moodlewsrestformat=json')
        .then(function (response) {
            truncate_table(pool,'xx_Moodle_Courses')
            var course_data = response.data;
            for (const course of course_data) {
                insertTable_Courses(course,pool)
            }
        })
        .catch(function (error) {
            console.log('API : Moodle : core_courses : error '+error);
        })
        .then(function () {
            // always executed
        });
}).catch(err =>{
    console.info('SQL Connect error '+err)
})

