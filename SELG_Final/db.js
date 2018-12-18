var mysql = require('mysql');

// @TODO via ENV. files

var connection = mysql.createConnection({
    host: "192.168.178.37",
    port: "3306",
    user: "node_connection",
    password: process.env.DB_PASSWORD,
    database: "selg_schema"
});
console.log(process.env);
connection.connect( (err) => { if(err) {throw err}});

module.exports = connection; //a&r6a90$48|wfa9awfg8wgaa9a0gag0ga0ag0ffaffm0=