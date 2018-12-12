const express = require('express');
var bodyParser = require("body-parser");
var mysql = require('mysql');
const app = express();
const crypto = require("crypto");

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Useless
app.get('/login', (request, respond) => {
    respond.sendfile('test_fachlehrer.txt');
})

app.post('/post', (request,respond) => {
    respond.end();
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});


/*
var con = mysql.createConnection({
    host: "185.233.105.88",
    port: "32330",
    user: "root",
    password: "password",
    database: "selg_students_list"
});

con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT * FROM `Users`", function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result[0])+"\r\n"+JSON.stringify(result[1]));
    });
  });
*/