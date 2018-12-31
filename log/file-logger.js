// File cal.js
var fs = require('fs');
var datetime = require('node-datetime');

module.exports = {
    log: function() {
        fs.appendFile(__dirname + "/server.log",
            [
                datetime.create().format('m/d/Y H:M:S')+
                ":",
                "[ RESTART ]",
                "Restarting due to changes...",
                "\r\n"
            ].join(' '), 
                function (err) {
                    if (err) return console.log(err);
                }
        );}
};

