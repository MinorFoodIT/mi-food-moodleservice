require('dotenv').config({silent: true});

const config = {
    token: process.env.token,
    userName: process.env.username,
    password: process.env.password,
    server: process.env.server,
    database: process.env.database

}
module.exports = config;