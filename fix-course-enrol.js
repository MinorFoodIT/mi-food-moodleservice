const axios = require('axios');
var config = require('./config/config')

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

function updateTable_state(type,id,status,note,pool){
    return pool.request()
        .input('type',sql.NVarChar(50),type)
        .input('id',sql.Int,id)
        .input('status',sql.NVarChar(50),status)
        .input('note',sql.NVarChar(100),note)
        .input('updatedate',sql.DateTime,new Date())

        .query('Update xx_Moodle_State set status=@status ,note=@note ,updatedate=@updatedate where id=@id and type=@type')
        .then(result =>{
            //
        }).catch(err=>{ console.log('DB : updateTable_state : NVarChar : error '+err)})
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
        return selectCoursePending(pool);
    }).catch(err =>{
        console.info('SQL Connect error '+err)
        pool.close()
        process.exit(1);
    })
}

do {
    console.log('start function to check course is pendding ,'+new Date().toLocaleString());
    setTimeout(function(){
        return doHttp();
    },600000);

}while( doHttp() == [] );
//pool.close();
process.emit(0);
