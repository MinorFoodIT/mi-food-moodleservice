var config = require('./config')

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

module.exports = {dbconfig}