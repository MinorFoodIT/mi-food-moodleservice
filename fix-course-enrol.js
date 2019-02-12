const axios = require('axios');
var config = require('./config/config')
var logger = require('./config/winston')
var info = 'info'
var {insertTable_EnrolledCourse ,updateTable_state ,insertTable_Users} = require('./dao/dao')

const sql = require('mssql')

var axiosRetry = require('axios-retry');
axiosRetry(axios, { retries: 10 });

axios.defaults.baseURL = 'https://learning.minorfood.com';
axios.defaults.headers.post['Content-Type'] = 'application/json';

var dbconfig = {
    user: config.user, // update me
    password: config.password ,// update me
    server: config.server,
    database: config.database,
    options: {
        trustedConnection: true
    }
}

function selectCoursePending(pool){
    return pool.request()
        .input('type',sql.NVarChar(50),'course-enroll')
        .input('status',sql.NVarChar(50),'call pending')

        .query('select id from xx_Moodle_State where type=@type and status=@status ')
        .then(result =>{
            //result.recordset
            //result.rowsAffected  //row count
            if(result.rowsAffected.length > 0) {
                //console.info(result.rowsAffected)
                var course_data = result.recordset;
                (function theLoop (i,items) {
                    var course = items[i-1]
                    setTimeout(function () {
                        console.info('Do http get request with courseid '+course.id);
                        axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid='+course.id)
                            .then(function (response){
                                var user_data = response.data;
                                if(response.data.exception){
                                    console.info('HTTP : Moodle API : core_enrol_get_enrolled_users : courseid='+course.id+' : error '+response.data.message);
                                }else{
                                    console.info('HTTP : Moodle API : core_enrol_get_enrolled_users : courseid='+course.id+' : success');
                                    updateTable_state('course-enroll',course.id,'call success' ,'usercount='+user_data.length ,pool)
                                    for (const user of user_data) {
                                        insertTable_Users(user,pool)
                                        insertTable_EnrolledCourse(course,user,pool)
                                    }
                                }
                            }).catch(function (error) {

                            console.info('HTTP : Moodle API : core_enrol_get_enrolled_users : '+course.id+' : error '+error);
                        })
                        if (--i) {          // If i > 0, keep going
                            theLoop(i,items);       // Call the loop again, and pass it the current value of i
                        }
                        if(i == 0){
                            //finish call api
                            console.info('finish core_course_get_courses process');
                            //pool.close()
                        }
                    }, 30000);

                })(course_data.length,course_data);

                //return course_data;

            }else{
                console.info('[]')
                return [];
            }

        }).catch(err=>{
            console.info('DB : selectCoursePending : NVarChar : error '+err)
            return [];
        })
}


function doHttp(){
    sql.close();
    sql.connect(config).then(pool => {
        var result = selectCoursePending(pool);
        console.log('dohttp return '+result);
        return result;

    }).catch(err =>{
        console.info('SQL Connect error '+err)
        pool.close()
        process.exit(1);
    })
}

var loop = 1
do {
    console.log('start function to check course is pendding ,'+new Date().toLocaleString());

    setTimeout(function(){
        return doHttp();
    },(60000 * (loop-1)) * (5 * loop) * loop);

    loop++;

}while(loop < 3);
//pool.close();
setTimeout( function(){
    process.emit(0);
} ,180000)
