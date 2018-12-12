const mysql = require('mysql');

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('test_fachlehrer.txt')
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

    const possible_kurse = ["deutsch", "mathematik", ""];













    // (`art`, `uik`, `uik_typ`, `fachlehrer_akronym`, `stufe`)
    var sql = "INSERT INTO `selg_schema`.`faecher_db` (`art`, `uik`, `uik_typ`, `fachlehrer_akronym`, `stufe`) VALUES ('"+username+"', '"+password+"', '"+name+"', '"+akronym+"');";
    con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    });


  });