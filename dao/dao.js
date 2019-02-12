var logger = require('./../config/winston')
var info = 'info'

function truncate_table(pool , tablename) {
    return pool.request()
        .query('truncate table '+tablename+'')
        .then(result =>{
            logger.log(info,'Clearing or truncate '+tablename+' is complete.')
        })
        .catch(err=>{ logger.log(info,'DB : truncate_table : NVarChar : error '+err) })
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
        }).catch(err=>{ logger.log(info,'DB : insertTable_CourseCategories : NVarChar : error '+err) })
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
        }).catch(err=>{ logger.log(info,'DB : insertTable_Courses : NVarChar : error '+err) })
}


function insertTable_EnrolledCourse(course ,user ,pool){
    return pool.request()
        .input('courseid', sql.Int, course.id)
        .input('userid', sql.Int, user.id)

        .query('Insert into xx_Moodle_EnrolledCourses (courseid,userid) ' +
            'values (@courseid,@userid)')
        .then(result => {
            //console.dir(result)
        }).catch(err=>{ logger.log(info,'DB : insertTable_EnrolledCourse : NVarChar : error '+err) })
}

function insertTable_state(type,id,status,pool){
    return pool.request()
        .input('type',sql.NVarChar(50),type)
        .input('id',sql.Int,id)
        .input('status',sql.NVarChar(50),status)
        .input('startdate',sql.DateTime,new Date())

        .query('Insert into xx_Moodle_State (type,id,status,startdate) values(@type,@id,@status,@startdate)')
        .then(result =>{
            //
        }).catch(err=>{ logger.log(info,'DB : insertTable_state : NVarChar : error '+err)})
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
        }).catch(err=>{ logger.log(info,'DB : updateTable_state : NVarChar : error '+err)})
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


module.exports = {truncate_table ,insertTable_CourseCategories ,insertTable_Courses ,insertTable_EnrolledCourse ,insertTable_state ,updateTable_state ,insertTable_Users}