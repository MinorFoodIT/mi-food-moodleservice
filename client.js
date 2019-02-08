const axios = require('axios');
var config = require('./config/config')
var logger = require('./config/winston')

const sql = require('mssql')

var axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 5 });

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
            logger.info('Do truncate '+tablename+' complete')
        })
        .catch(err=>{})
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
            //console.dir(result)
        }).catch(err=>{})
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
            //console.dir(result)
        }).catch(err=>{})
}


function insertTable_EnrolledCourse(course ,user ,pool){
    return pool.request()
        .input('courseid', sql.Int, course.id)
        .input('userid', sql.Int, user.id)

        .query('Insert into xx_Moodle_EnrolledCourses (courseid,userid) ' +
            'values (@courseid,@userid)')
        .then(result => {
            //console.dir(result)
        }).catch(err=>{})
}

function insertTable_state(id,status,pool){
    return pool.request()
        .input('tpye',sql.NVarChar(50),'course-enroll')
        .input('id',sql.Int,id)
        .input('status',sql.NVarChar(50),status)

        .query('Insert into xx_Moodle_State (type,id,status) values(@type,@id,@status)')
        .then(result =>{
            //
        }).catch(err=>{ logger.info('DB : NVarChar : error '+err)})
}

function updateTable_state(id,status,note,pool){
    return pool.request()
        .input('tpye',sql.NVarChar(50),'course-enroll')
        .input('id',sql.Int,id)
        .input('status',sql.NVarChar(50),status)
        .input('note',sql.NVarChar(100),note)

        .query('Update xx_Moodle_State set status=@status where id=@id and type=@type and node=@node')
        .then(result =>{
            //
        }).catch(err=>{ logger.info('DB : NVarChar : error '+err)})
}

function insertTable_Users(user ,pool){

    return pool.request()
        .input('id',sql.Int,user.id)
        .query('select 1 from xx_Moodle_Users where id=@id')
        .then(result =>{
            //console.log(result.rowsAffected)
            if(result.rowsAffected){
                if(result.rowsAffected[0] == 0){
                    //console.log('Insert user '+user.id)
                    return pool.request()
                        .input('id', sql.Int, user.id)
                        .input('username', sql.NVarChar(255), user.username)
                        .input('firstname', sql.NVarChar(255), user.firstname)
                        .input('lastname', sql.NVarChar(255), user.lastname)
                        .input('fullname', sql.NVarChar(500), user.fullname)
                        .input('email', sql.NVarChar(255), user.email)
                        .input('phone1', sql.NVarChar(255), user.phone1)
                        .input('phone2', sql.NVarChar(255), user.phone2)
                        .input('department', sql.NVarChar(255), user.department)
                        .input('institution', sql.NVarChar(255), user.institution)
                        .input('idnumber', sql.NVarChar(255), user.idnumber)
                        .input('firstaccess', sql.Int, user.firstaccess)
                        .input('lastaccess', sql.Int, user.lastaccess)

                        .query('Insert into xx_Moodle_Users (id,username,firstname,lastname,fullname,email,phone1,phone2,department,institution,idnumber,firstaccess,lastaccess) ' +
                            'values (@id,@username,@firstname,@lastname,@fullname,@email,@phone1,@phone2,@department,@institution,@idnumber,@firstaccess,@lastaccess)')
                        .then(result => {
                            //console.dir(result)
                        })
                }else{
                    //console.log('Exist user '+user.id)
                }
            }

        }).catch(err=>{})
}

/*
function redoRequest(courseid,pool){

        axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid='+courseid)
            .then(function (response){
                    var user_data = response.data;
                    if(response.data.exception){
                        console.log('API : Moodle : enrolled_courses : '+course.id+' : error '+response.data.message);
                    }else{
                        for (const user of user_data) {
                            insertTable_Users(user,pool)
                            insertTable_EnrolledCourse(course,user,pool)
                        }
                    }
            }).catch(function (error) {

                console.log('API : Moodle : enrolled_courses : '+courseid+' : error '+error);
                return axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid='+courseid)
            })
            .then(function (response){
                var user_data = response.data;
                if(response.data.exception){
                    console.log('API redo: Moodle : enrolled_courses : '+course.id+' : error '+response.data.message);
                }else{
                    for (const user of user_data) {
                        insertTable_Users(user,pool)
                        insertTable_EnrolledCourse(course,user,pool)
                    }
                }
            })
}
*/


logger.info('start service '+new Date())

sql.connect(config).then(pool => {

    axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_course_get_categories&moodlewsrestformat=json&criteria[0][key]=parent&criteria[0][value]=0')
        .then(function (response) {
            truncate_table(pool,'xx_Moodle_CourseCategories')
            var course_data = response.data;
            for (const course of course_data) {
                insertTable_CourseCategories(course,pool)
            }
            logger.info('Insert catogeries '+response.data.length+' row(s)')
        })
        .catch(function (error) {
            logger.info('HTTP : Moodle API : core_course_get_categories : error '+error);
        })
        .then(function () {
            // always executed
        });

    axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_course_get_courses&moodlewsrestformat=json')
        .then(function (response) {
            truncate_table(pool,'xx_Moodle_Courses')
            truncate_table(pool,'xx_Moodle_Users')
            truncate_table(pool,'xx_Moodle_EnrolledCourses')
            truncate_table(pool,'xx_Moodle_State')

            var course_data = response.data;
            //var pools = pool
            (function theLoop (i,items) {
                var course = items[i-1]
                insertTable_state(course.id,'call pending',pool)

                insertTable_Courses(course,pool)

                setTimeout(function () {
                    logger.info('Do http get request with courseid '+course.id)
                    axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid='+course.id)
                        .then(function (response){
                            var user_data = response.data;
                            if(response.data.exception){
                                logger.info('HTTP : Moodle API : core_enrol_get_enrolled_users : courseid='+course.id+' : error '+response.data.message);
                            }else{
                                logger.info('HTTP : Moodle API : core_enrol_get_enrolled_users : courseid='+course.id+' : success')
                                updateTable_state(course.id,'call success' ,'usercount='+user_data.length ,pool)
                                for (const user of user_data) {
                                    insertTable_Users(user,pool)
                                    insertTable_EnrolledCourse(course,user,pool)
                                }
                            }
                        }).catch(function (error) {
                            // {"exception":"moodle_exception","errorcode":"unknowncategory","message":"error\/unknowncategory"}

                            logger.info('HTTP : Moodle API : core_enrol_get_enrolled_users : '+courseid+' : error '+error);
                        })
                    if (--i) {          // If i > 0, keep going
                        theLoop(i,items);       // Call the loop again, and pass it the current value of i
                    }
                    if(i == 0){
                        //finish call api
                        logger.info('finish core_course_get_courses process')
                    }
                }, 5000);

            })(course_data.length,course_data);


            logger.info('Insert courses '+response.data.length+' row(s)')
        })
        .catch(function (error) {
            logger.info('HTTP : Moodle API : core_courses_get_courses : error '+error);
        })
        .then(function () {
            // always executed
        });

}).catch(err =>{
    console.info('SQL Connect error '+err)
})

/*
axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_course_get_courses&moodlewsrestformat=json')
    .then(function (response) {
        var course_data = response.data;
        logger.info('All courses is '+course_data.length +' ,time '+new Date())
        var count = 0;
        //for (const course of course_data) {
            (function theLoop (i,items) {
                var course = items[i-1]
                setTimeout(function () {
                    logger.info('do request with '+course.id)
                    axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid='+course.id)
                        .then( res =>{
                                count = count + 1
                                logger.info(course.id+' success ,count ='+count +' ,time '+new Date())
                            }
                        )
                        .catch( err =>{
                                logger.info('request error '+course.id+' ,'+err)
                            }
                        )
                    if (--i) {          // If i > 0, keep going
                        theLoop(i,items);       // Call the loop again, and pass it the current value of i
                    }
                }, 15000);
            })(course_data.length,course_data);

        //}

    })
    .catch( err =>{
            logger.info('main request error '+err)
        }
    )
*/