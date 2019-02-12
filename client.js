const axios = require('axios');
var {dbconfig} = require('./config/dbconfig')
var logger = require('./config/winston')
var info = 'info'
var {truncate_table ,insertTable_CourseCategories ,insertTable_Courses ,insertTable_EnrolledCourse ,insertTable_state ,updateTable_state ,insertTable_Users} = require('./dao/dao')

const sql = require('mssql')

var axiosRetry = require('axios-retry');
axiosRetry(axios, { retries: 5 });

axios.defaults.baseURL = 'https://learning.minorfood.com';
axios.defaults.headers.post['Content-Type'] = 'application/json';

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


logger.info('Start client service ,'+new Date().toLocaleString())

sql.connect(dbconfig).then(pool => {

    axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_course_get_categories&moodlewsrestformat=json&criteria[0][key]=parent&criteria[0][value]=0')
        .then(function (response) {

            truncate_table(pool,'xx_Moodle_CourseCategories')

            var course_data = response.data;
            for (const course of course_data) {
                insertTable_CourseCategories(course,pool)
            }
            logger.log(info,'Inserting catogeries '+response.data.length+' row(s)')
        })
        .catch(function (error) {
            logger.log(info,'HTTP : Moodle API : core_course_get_categories : error '+error);
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
            (function theLoop (i,items) {
                var course = items[i-1]
                insertTable_state('course-enroll',course.id,'call pending',pool)

                insertTable_Courses(course,pool)

                setTimeout(function () {
                    logger.log(info,'Do http get request with courseid '+course.id)
                    axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid='+course.id)
                        .then(function (response){
                            var user_data = response.data;
                            if(response.data.exception){
                                logger.log(info,'HTTP : Moodle API : core_enrol_get_enrolled_users : courseid='+course.id+' : error '+response.data.message);
                            }else{
                                logger.log(info,'HTTP : Moodle API : core_enrol_get_enrolled_users : courseid='+course.id+' : success')

                                updateTable_state('course-enroll',course.id,'call success' ,'usercount='+user_data.length ,pool)
                                for (const user of user_data) {
                                    insertTable_Users(user,pool)
                                    insertTable_EnrolledCourse(course,user,pool)
                                }
                            }
                        }).catch(function (error) {
                            logger.log(info,'HTTP : Moodle API : core_enrol_get_enrolled_users : '+course.id+' : error '+error);
                            // {"exception":"moodle_exception","errorcode":"unknowncategory","message":"error\/unknowncategory"}
                        })
                    if (--i) {          // If i > 0, keep going
                        theLoop(i,items);       // Call the loop again, and pass it the current value of i
                    }
                    if(i == 0){
                        //finish call api
                        //pool.close();
                        logger.log(info,'Finish core_course_get_courses process')
                    }
                }, 5000);

            })(course_data.length,course_data);
            logger.log(info,'Insert courses '+response.data.length+' row(s)')
        })
        .catch(function (error) {
            logger.log(info,'HTTP : Moodle API : core_courses_get_courses : error '+error);
        })
        .then(function () {
            // always executed
            setTimeout(function(){
                logger.log(info,'Delayed 60 minutes let calling web api to complete')
                logger.log(info,'Pool is closed and close program')
                process.exit(0)
            },3600000);
            //pool.close()

        });

}).catch(err =>{
    logger.log(info,'SQL Connect error '+err)
    process.exit(1)
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

function selectCoursePending(courseid,pool){

    return pool.request()
        .input('type',sql.NVarChar(50),'course-enroll')
        .input('id',sql.Int,id,courseid)
        .input('status',sql.NVarChar(50),'call pending')

        .query('select 1 from xx_Moodle_State  where id = @id and type=@type and status=@status) ')
        .then(result =>{
            if(result.rowsAffected) {
                if (result.rowsAffected[0] == 1) {
                    return true;
                }else{
                    return false;
                }
            }else{
                return false;
            }

        }).catch(err=>{
            logger.info('DB : NVarChar : error '+err)
            return false;
        })
}
*/