var mysql = require("mysql");

// @TODO via ENV. files

var connection = mysql.createConnection({
  /* 
    Mein PC:
        host: "192.168.178.37",
        port: "3306",
        user: "node_connection",
        password: "a&r6a90$48|wfa9awfg8wgaa9a0gag0ga0ag0ffaffm0=",
        database: "selg_schema"
  */
  /* 
    Für den VPS lokal*/ 
      host: "Service_Selg_MySql",
      port: "3306",
      user: "node_con",
      password: "password",
      database: "selg_schema",
      insecureAuth : true
  
 /*
    host: "185.233.105.88",
    port: "3306",
    user: "node_con",
    password: "password",
    database: "selg_schema",
    insecureAuth : true*/
});

connection.connect(err => {
  if (err) {
    throw err;
  }
});

module.exports = connection;
