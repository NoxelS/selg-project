const express = require('express');
var bodyParser = require("body-parser");
var mysql = require('mysql');
const app = express();
const crypto = require("crypto");
/*
var Student = function(name, lastname){
    this.firstname = name,
    this.lastname =  lastname
}
var Students = [];

Students.push(new Student("Max", "Müller"))
Students.push(new Student("Peter", "Müller"))
Students.push(new Student("Hans", "Mustermann"))
Students.push(new Student("Emilia", "Schneider"))
Students.push(new Student("Hanse", "Mann"))
Students.push(new Student("Lisa", "Lischen"))
Students.push(new Student("Tom", "Müller"))
Students.push(new Student("Leonie", "Muster"))
Students.push(new Student("Testus", "Tastus"))
Students.push(new Student("Lorem", "Ipsum"))
*/

var User = function(username, password){
    this.username = username,
    this.password =  password
}

var Users = [];

Users.push(new User('Admin', 'Password'));
Users.push(new User('Noel', 'Passwort'));

var tokens = [];

var Token = function(info_text, user, loggedIn){
    this.loggedIn = loggedIn;
    this.text = info_text;
    this.token = crypto.randomBytes(20).toString('hex');
    this.activeUser = user;
    tokens.push(this.token);
}

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
app.get('/panel', (request, respond) => {
    respond.sendfile('panel.html');
})

app.post('/post', (request,respond) => {

    var data = JSON.parse(Object.keys(request.body)[0]);
    console.log("User trying to login: "+JSON.stringify(data));

    Users.forEach((User) => {
        if(User.username === data.username && User.password === data.password){
            const tmpToken = new Token("Logged in...", User, true);
            console.log("User Logged in. Genertaed Token:" + tmpToken.token);
            console.log("Tokens: " + JSON.stringify(tokens));
            console.log("Sending: "+JSON.stringify(tmpToken));
            respond.end(JSON.stringify(tmpToken));
        }
    });
    
    respond.end(JSON.stringify(
        {
            loggedIn: false
        }
    ));

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