const axios = require('axios');
var config = require('./config/config')

axios.defaults.baseURL = 'https://learning.minorfood.com';
axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.get('/webservice/rest/server.php?wstoken=' + config.token + '&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=61')
    .then(function (response){
            console.info("callback success")
            console.info(response.data)
            var user_data = response.data;
            if(response.data.exception){
                console.log('API : Moodle : enrolled_courses : '+course.id+' : error '+response.data.message);
            }else{
                for (const user of user_data) {
                    console.info(user)
                }
            }
        }
    ).catch(function (error) {
        console.info("callback success")
        console.info(error)
    })