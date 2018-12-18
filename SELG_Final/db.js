var mysql = require('mysql');

// @TODO via ENV. files

var connection = mysql.createConnection({
    host: "192.168.178.37",
    port: "3306",
    user: "node_connection",
    password: "a&r6a90$48|wfa9awfg8wgaa9a0gag0ga0ag0ffaffm0=",
    database: "selg_schema"
});

connection.connect( (err) => { if(err) {throw err}});

module.exports = connection; 