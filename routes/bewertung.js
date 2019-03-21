var express = require("express");
var router = express.Router();
var datetime = require("node-datetime");
var db = require("../db");
/* GET rating page. */

router.get("/neu/schuelerid=:id/kursid=:kid", function(req, res, next) {
  // :id => Schülerid, :kid => Kursid
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false,
    location: "Neue Bewertung",
  };

  // @TODO
  // Checkt ob der User die berechtigung hat für deisen Schüler eine
  // Bewertung zu schreiben


  // @TODO 
  // Checkt ob der Schüler in dem Kurs ist

  db.query("SELECT * FROM schueler_db WHERE id = ?", [req.params.id], function(
    err,
    result
  ) {
    if (err) {
      return next(new Error(err.message));
    } else {
      handlebars_presettings.schuelername = result[0].name;
      handlebars_presettings.schuelerid = req.params.id;

      db.query("SELECT * FROM kurs_db WHERE id = ?", [req.params.kid], function(
        err,
        result
      ) {
        if (err) {
          return next(new Error(err.message));
        } else {
          handlebars_presettings.kursname = result[0].name;
          handlebars_presettings.kursid = req.params.kid;

          if (result[0].leistungsebene === null) {
            handlebars_presettings.leistungsebene = undefined;
          } else {
            handlebars_presettings.leistungsebene = result[0].leistungsebene;
          }

          res.render("neue_bewertung", handlebars_presettings);
        }
      });
    }
  });
});

router.post("/neu", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false,
    location: "Neue Bewertung",
    json: JSON.stringify(req.body),
    length: Object.keys(req.body).length,
    missing_value: false
  };

  if (Object.keys(req.body).length === 206 /* ! @TODO */) {
    // @TODO
    handlebars_presettings.missing_value = "Bitte füllen Sie alle Felder aus!";
    res.render("neue_bewertung", handlebars_presettings);

  } else {
    var datetime = require('node-datetime');

    // Bei Manueller Erstellung wird berücksichtigt, dass Kurse unter der achten Klasse keine Leistungsebene besitzen.
    if(req.body.leistungsebene.length === 0){
      req.body.leistungsebene = "g";
    }
    
    var insert_array =
    [
      req.body.schueler_id, req.body.kurs_id,res.locals.user_id, datetime.create().format("d.m.Y") , req.body.name, req.body.fach, req.body.leistungsebene, req.body.kommentar,
      req.body.soz_1,req.body.soz_2,req.body.soz_3,req.body.soz_4,req.body.soz_5_1,req.body.soz_5_2,req.body.soz_6,
      req.body.lernab_1,req.body.lernab_2,req.body.lernab_3,req.body.lernab_4,req.body.lernab_5,req.body.lernab_6,req.body.lernab_7,req.body.lernab_8,req.body.lernab_9_1,req.body.lernab_9_2,req.body.lernab_9_3,req.body.lernab_10,
      req.body.kommentar_1,req.body.kommentar_2,req.body.kommentar_3,req.body.kommentar_4,req.body.kommentar_51,req.body.kommentar_52,req.body.kommentar_6,req.body.kommentar_7,req.body.kommentar_8,req.body.kommentar_9,req.body.kommentar_10,req.body.kommentar_11,req.body.kommentar_12,req.body.kommentar_13,req.body.kommentar_14,req.body.kommentar_15,req.body.kommentar_16,req.body.kommentar_17,req.body.kommentar_18
    ];

    // Es wird geschaut ob es dieses Schüler überhaupt in der Datenbank gibt
    db.query("SELECT * from `schueler_db` WHERE name = ?", [req.body.name], function(err, result){
      if(err){ return next(new Error(err.message)); }
      if(result.length === 0){ return next(new Error("Es konnte kein Schüler mit dem Namen "+req.body.name+" gefunden werden."))}else{
        db.query("SELECT * from `kurs_db` WHERE name = ?", [req.body.fach], function(err, result){
          if(err){ return next(new Error(err.message)); }
          if(result.length === 0){ return next(new Error("Es konnte kein Kurs mit dem Namen "+req.body.fach+" "+req.body.leistungsebene+" gefunden werden."))}else{
    
        /*
        var insert_array = [];

        for(var i = 0; i < post_request.length; i++){
          if(post_request[i] === undefined){
            insert_array.push("undefined");
          }else{
            insert_array.push(post_request[i]);
          }
        }
        */
      
        db.query(
          "INSERT INTO `selg_schema`.`bewertungen_db` "
          + "(`schueler_id`, `kurs_id`, `lehrer_id`, `date`,`schueler_name`, `kurs_name`, `leistungsebene`, `kommentar`,"
          + "`soz_1`, `soz_2`, `soz_3`, `soz_4`, `soz_5_1`, `soz_5_2`, `soz_6`," 
          + "`lear_1`, `lear_2`, `lear_3`, `lear_4`, `lear_5`, `lear_6`, `lear_7`, `lear_8`, `lear_9_1`, `lear_9_2`, `lear_9_3`, `lear_10`, "
          + "`k_1`, `k_2`, `k_3`, `k_4`, `k_5_1`,`k_5_2`, `k_6`, `k_7`, `k_8`, `k_9`, `k_10`, `k_11`, `k_12`, `k_13`, `k_14`, `k_15`, `k_16`, `k_17`, `k_18`) "
          + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
          insert_array,
          function(err, result, fields) {
            if (err) {
              return next(new Error(err.message));
            } else {
              db.query(
                "SELECT LAST_INSERT_ID() as last_bewertung",
                (error, results, fields) => {
                  if (error) {
                    return next(new Error(error.message));
                  } else {
                    // @TODO Suche die Kurse in welchen er Standartmäßig ist
                    console.log(
                      [
                        datetime.create().format("m/d/Y H:M:S"),
                        ": [ NEUE BEWERTUNG ] -> "+results[0].last_bewertung
                      ].join("")
                    );
                    res.redirect("/bewertung/view="+results[0].last_bewertung);
                  }
                }
              );
            }
          }
        );
      }});
    }});

  }
});

router.get("/neu", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false,
    location: "Neue Bewertung",
  };

  res.render("bewertungen/neue_bewertung_manuell", handlebars_presettings)
});


// Exportiert eine Bewertung als PDF
router.get("/download=:id", function(req, res, next) {

  db.query("SELECT * FROM bewertungen_db WHERE id = ?", [req.params.id], function(err, bewertung_presetting){
    // Die Seite gibt es nicht
    if(err || bewertung_presetting.length === 0) return next(new Error(""));
    // Die Seite gibt es, aber der Nutzer hat keine berechtigung sie zu sehen
    if(bewertung_presetting[0].lehrer_id != res.locals.user_id) return next(new Error(""));

    const pdf = require('phantom-html2pdf');
    const Handlebars = require('handlebars');
    const fs = require('fs');

    Handlebars.registerHelper('ifEqual', function(a, b, opts) {
      if(a == b) // Or === depending on your needs
          return opts.fn(this);
      else
          return opts.inverse(this);
    });

    Handlebars.registerHelper('calcRows', function(text) {
      const lineLength = "AAAABBBBAAAABBBBAAAABBBBAAAABBBBAA".length;
      text = text+"";
      if(text.length >= 3*lineLength) return 4;
      if(text.length >= 2*lineLength) return 3;
      if(text.length >= lineLength) return 2;
      return 1;
    });


    //var temp = fs.readFileSync('./views/bewertungen/view_pdf.hbs','utf8');
    fs.readFile('./views/bewertungen/view_pdf.hbs','utf8', (err, temp) => {
      if (err) return next(new Error("Fehler beim Download..."+err.message));
      let template = Handlebars.compile(temp);
      var pdfOptions = {
        html: template(bewertung_presetting[0]),
        paperSize: {
          format: 'A4',
          orientation: 'portrait',
          border: '1cm',
          deleteOnAction: true
        }
      };
      pdf.convert(pdfOptions, function(err, result) {
        result.toFile(__dirname+"/SELG-Protokoll-"+bewertung_presetting[0].schueler_name.split(" ")[0]+"-"+bewertung_presetting[0].schueler_name.split(" ")[1]+".pdf", function() {
          var file =__dirname+"/SELG-Protokoll-"+bewertung_presetting[0].schueler_name.split(" ")[0]+"-"+bewertung_presetting[0].schueler_name.split(" ")[1]+".pdf";
          res.download(file); // Set disposition and send it.
        });
      });
    });  
  });
});


router.get("/view=:id", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false,
    location: "Bewertung ansehen",
    json: req.params.id
  };


  db.query("SELECT * FROM bewertungen_db WHERE id = ?", [req.params.id], function(    err,    result  ) {
    if (err) {
      return next(new Error(""));
    } else if(result[0].lehrer_id != res.locals.user_id){
      return next(new Error(""));
    }else {
      // Das Result-Objekt wird mit dem HBS-Presettings Objekt verbunden
      for (var key in result[0]) {
        if (result[0].hasOwnProperty(key)) handlebars_presettings[key] = result[0][key];
      }

      handlebars_presettings.json = JSON.stringify(result);
      res.render("bewertungen/view", handlebars_presettings)
    }
  });
});

module.exports = router;

//res.render("bewertung_test", handlebars_presettings);
