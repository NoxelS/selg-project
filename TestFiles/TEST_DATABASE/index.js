const mysql = require('mysql');
const fs = require('fs');
const PDFDocument = require('pdfkit');
var doc = new PDFDocument();

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
    var sql = "SELECT * FROM schueler_db ORDER BY stufe DESC, klassen_suffix DESC";
    con.query(sql, function (err, result) {
        if (err) throw err;
 
        var list_as_test = "";
        doc.pipe(fs.createWriteStream('output.pdf'));
        doc.font('fonts/timesbi.ttf').fontSize(25).text('Schülertestliste', 100, 100);
        result.sort((a, b) => {return a.id - b.id}).forEach(Student => {
            list_as_test+=(`[${Student.id}]: ${Student.name}\n`);
            console.log(list_as_test);
        });
        doc.font('fonts/times.ttf').fontSize(11).text(list_as_test, 100, 130);
        doc.end()
        console.log("Finished...")
    });

  });