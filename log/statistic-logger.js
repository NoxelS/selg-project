// File cal.js
var datetime = require('node-datetime');


module.exports = {
    logSession: function() {
        var db = require('../db')
        db.query(
            "INSERT INTO `selg_schema`.`session_history` (`date`) VALUES (?);",
            [datetime.create().format('m-d-Y')],
            function(err, result, fields) {
              if (err) {
                return next(new Error(err.message));
              }
            }
          );
        }
};
