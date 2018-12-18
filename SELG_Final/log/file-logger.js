// File cal.js
var fs = require('fs');
var datetime = require('node-datetime');

module.exports = {
    log: function() {
        fs.appendFile("server.log",
        [ 
            datetime.create().format('m/d/Y H:M:S'),
            "Restarted due to changes..."
        ].join(' '), function (err) {
            if (err) {console.log(err)}else{console.log("changes")};
          });
        }
};

