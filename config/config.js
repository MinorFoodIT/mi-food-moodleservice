require('dotenv').config({silent: true});

const config = {
    token: process.env.token,
    user: process.env.user,
    password: process.env.password,
    server: process.env.server,
    database: process.env.database

}
module.exports = config;