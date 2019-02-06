var winston = require('winston');

// define the custom settings for each transport (file, console)
var options = {
    file: {
        level: 'info',
        filename: __dirname+'/logs/app.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

var logger = new winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

/*
* By default, morgan outputs to the console only, so let's define a stream function that will be able to get morgan-generated output into the winston log files.
* We will use the info level so the output will be picked up by both transports (file and console):
* */
logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    },
};

module.exports = logger;