const express = require('express');
var bodyParser = require("body-parser");
var mysql = require('mysql');
const app = express();

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


app.get('/', (request, respond) => {
    respond.send(JSON.stringify(Students))
})

app.post('/post', (request,respond) => {

    var data = JSON.parse(Object.keys(request.body)[0]);
    console.log(typeof data);
    if(data.login === 'test' && data.password === 'password'){
        respond.end("Right Login");
    }else{
        respond.end("Wrong Login");
    }


});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});



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
