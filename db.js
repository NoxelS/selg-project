var mysql = require("mysql");

var connection = mysql.createConnection({
    host:   process.env.MYSQL_HOST_IP,
    port:   process.env.MYSQL_HOST_PORT,
    user:   process.env.MYSQL_HOST_USER,
    password:   process.env.MYSQL_HOST_PASSWORD,
    database:   process.env.MYSQL_HOST_DATABASE,
    insecureAuth :   process.env.MYSQL_HOST_INSECUREAUTH,
});

connection.connect(err => {
  if (err) {
    throw err;
  }
});

module.exports = connection;
