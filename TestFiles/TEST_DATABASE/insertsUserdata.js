const mysql = require('mysql');

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('testnames.txt')
});

var test_names = [];
var i = 0;
lineReader.on('line', function (line) {
  line = line.split(" ");
  //console.log(i+'(l:'+(line[0].length+line[1].length+1)+'): '+line[0] +" "+ line[1]);
  i++;
  test_names.push((line[0]+" "+line[1]));
});




var con = mysql.createConnection({
    host: "192.168.178.37",
    port: "3306",
    user: "node_connection",
    password: "a&r6a90$48|wfa9awfg8wgaa9a0gag0ga0ag0ffaffm0=",
    database: "selg_schema"
  });
  
  con.connect(function(err) {
    /*
    if (err) throw err;
    console.log("Connected!");
    var sql = "SELECT * FROM schueler_db";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
    });

    sql = "SELECT * FROM admin_db";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
    });
    */

   if (err) throw err;

    const valid_suffix = ['a', 'b', 'c', 'd']

    for(var g = 0; g < test_names.length; g++){
      var name = test_names[g];
      var year = (Math.floor((Math.random() * 6)))+2000;
      var month = (Math.floor((Math.random() * 12) + 1));
      var day = (Math.floor((Math.random() * 31) + 1));
      if(month < 10) month = "0"+month;
      if(day < 10) day = "0"+day;
      var geburtsdatum = `${year}-${month}-${day}`;
      var stufe = (Math.floor((Math.random() * 5) + 1)+5)
      var suffix = valid_suffix[(Math.floor((Math.random() * 4)))];
      var index = Math.floor((Math.random() * 100) + 1);
      console.log(`Adding User ${name} ${geburtsdatum} ${stufe} ${suffix} ${index}`);
      var sql = "INSERT INTO `selg_schema`.`schueler_db` (`name`, `geburtsdatum`, `stufe`, `klassen_suffix`, `index`) VALUES ('"+name+"', '"+geburtsdatum+"', '"+stufe+"', '"+suffix+"', '"+index+"');";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result);
      });
    } 
  });