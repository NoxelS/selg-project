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
    next: req.query.next
  };

  // TODO 
  // Checkt ob der User die berechtigung hat für deisen Schüler eine
  // Bewertung zu schreiben


  // TODO Checkt ob der Schüler in dem Kurs ist

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

  if (Object.keys(req.body).length === 206 /* ! @TODO Checken ob alles ausgefüllt ist*/) {
    // @TODO
    handlebars_presettings.missing_value = "Bitte füllen Sie alle Felder aus!";
    res.render("neue_bewertung", handlebars_presettings);

  } else {

    var datetime = require('node-datetime');

    if(req.body.manuell_erstellt){
      req.body.fach = req.body.Kurs.split(" ")[0];
      req.body.leistungsebene = req.body.Kurs.split(" ")[1];

      db.query("SELECT id FROM schueler_db WHERE name = ?", [req.body.name], (err, result) => {
        if(err || result.length === 0) return next(new Error("Diesen Schüler gibt es leider nicht..."))
        req.body.schueler_id = result[0].id;
        db.query("SELECT id FROM kurs_db WHERE name = ? AND leistungsebene = ? AND lehrer_id = ?", [req.body.fach, req.body.leistungsebene, res.locals.user_id], (err, result) => {
          if(err || result.length === 0) return next(new Error("Diesen Kurs gibt es leider nicht..."))
          req.body.kurs_id = result[0].id;      
          db.query("SELECT * FROM schueler_kurs_link WHERE id_schueler = ? AND id_kurs = ?", [req.body.schueler_id, req.body.kurs_id], (err, result) => {
            if(err || result.length === 0) return next(new Error("Dieser Schüler ist nicht im angegebenen Kurs vorhanden."))

            /* Altes Bewertungssystem
            var insert_array =
            [
              req.body.schueler_id, req.body.kurs_id,res.locals.user_id, datetime.create().format("d.m.Y") , req.body.name, req.body.fach, req.body.leistungsebene, req.body.kommentar,
              req.body.soz_1,req.body.soz_2,req.body.soz_3,req.body.soz_4,req.body.soz_5_1,req.body.soz_5_2,req.body.soz_6,
              req.body.lernab_1,req.body.lernab_2,req.body.lernab_3,req.body.lernab_4,req.body.lernab_5,req.body.lernab_6,req.body.lernab_7,req.body.lernab_8,req.body.lernab_9_1,req.body.lernab_9_2,req.body.lernab_9_3,req.body.lernab_10,
              req.body.kommentar_1,req.body.kommentar_2,req.body.kommentar_3,req.body.kommentar_4,req.body.kommentar_51,req.body.kommentar_52,req.body.kommentar_6,req.body.kommentar_7,req.body.kommentar_8,req.body.kommentar_9,req.body.kommentar_10,req.body.kommentar_11,req.body.kommentar_12,req.body.kommentar_13,req.body.kommentar_14,req.body.kommentar_15,req.body.kommentar_16,req.body.kommentar_17,req.body.kommentar_18
            ];
            */

            var insert_array =
            [
              req.body.schueler_id, req.body.kurs_id,res.locals.user_id, datetime.create().format("d.m.Y") , req.body.name, req.body.fach, req.body.leistungsebene, req.body.kommentar,
              req.body.soz_1,req.body.soz_2,req.body.soz_3,req.body.soz_4_1,req.body.soz_4_2,
              req.body.lernab_1,req.body.lernab_2,req.body.lernab_3,req.body.lernab_4,req.body.lernab_5,req.body.lernab_6,req.body.lernab_7,req.body.lernab_8_1,req.body.lernab_8_2,req.body.lernab_9,
              req.body.kommentar_1,req.body.kommentar_2,req.body.kommentar_3,req.body.kommentar_41,req.body.kommentar_42,req.body.kommentar_5,req.body.kommentar_6,req.body.kommentar_7,req.body.kommentar_8,req.body.kommentar_9,req.body.kommentar_10,req.body.kommentar_11,req.body.kommentar_12,req.body.kommentar_13,req.body.kommentar_14
            ];
          
            // Es wird geschaut ob es dieses Schüler überhaupt in der Datenbank gibt
            db.query("SELECT * from `schueler_db` WHERE name = ?", [req.body.name], function(err, result){
              if(err){ return next(new Error(err.message)); }
              if(result.length === 0){ return next(new Error("Es konnte kein Schüler mit dem Namen "+req.body.name+" gefunden werden."))}else{
                db.query("SELECT * from `kurs_db` WHERE name = ?", [req.body.fach], function(err, result){
                  if(err){ return next(new Error(err.message)); }
                  if(result.length === 0){ 
                    return next(new Error("Es konnte kein Kurs mit dem Namen "+req.body.fach+" "+req.body.leistungsebene+" gefunden werden."))
                  }else{

                    db.query("SELECT date, id FROM bewertungen_db WHERE (kurs_id = ? AND schueler_id = ?)",[ req.body.kurs_id, req.body.schueler_id], (err,result) =>{
                      if(err){ return next(new Error(err.message)); }
                      if(result.length > 0){ 
                        return next(new Error("Diese Bewertung wurde schon am "+result[0].date+" erstellt. Sie können sie unter 'Meine Bewertungen' bearbeiten."));
                    }else{
                      db.query(
                        "INSERT INTO `selg_schema`.`bewertungen_db` "
                        + "(`schueler_id`, `kurs_id`, `lehrer_id`, `date`,`schueler_name`, `kurs_name`, `leistungsebene`, `kommentar`,"
                        + "`soz_1`, `soz_2`, `soz_3`, `soz_4_1`, `soz_4_2`," 
                        + "`lear_1`, `lear_2`, `lear_3`, `lear_4`, `lear_5`, `lear_6`, `lear_7`, `lear_8_1`, `lear_8_2`, `lear_9`,"
                        + "`k_1`, `k_2`, `k_3`, `k_4`, `k_5`, `k_6`, `k_7`, `k_8`, `k_9`, `k_10`, `k_11`, `k_12`, `k_13`, `k_14`, `k_15`) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
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
                                  res.redirect("/bewertung/neu");
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                    });
                  }
                });
            }});
          });
        });
      });
    }else{
      
      var insert_array =
      [
        req.body.schueler_id, req.body.kurs_id,res.locals.user_id, datetime.create().format("d.m.Y") , req.body.name, req.body.fach, req.body.leistungsebene, req.body.kommentar,
        req.body.soz_1,req.body.soz_2,req.body.soz_3,req.body.soz_4_1,req.body.soz_4_2,
        req.body.lernab_1,req.body.lernab_2,req.body.lernab_3,req.body.lernab_4,req.body.lernab_5,req.body.lernab_6,req.body.lernab_7,req.body.lernab_8_1,req.body.lernab_8_2,req.body.lernab_9,
        req.body.kommentar_1,req.body.kommentar_2,req.body.kommentar_3,req.body.kommentar_41,req.body.kommentar_42,req.body.kommentar_5,req.body.kommentar_6,req.body.kommentar_7,req.body.kommentar_8,req.body.kommentar_9,req.body.kommentar_10,req.body.kommentar_11,req.body.kommentar_12,req.body.kommentar_13,req.body.kommentar_14
      ];

      // Es wird geschaut ob es dieses Schüler überhaupt in der Datenbank gibt
      db.query("SELECT * from `schueler_db` WHERE name = ?", [req.body.name], function(err, result){
        if(err){ return next(new Error(err.message)); }
        if(result.length === 0){ return next(new Error("Es konnte kein Schüler mit dem Namen "+req.body.name+" gefunden werden."))}else{
          db.query("SELECT * from `kurs_db` WHERE name = ?", [req.body.fach], function(err, result){
            if(err){ return next(new Error(err.message)); }
            if(result.length === 0){ return next(new Error("Es konnte kein Kurs mit dem Namen "+req.body.fach+" "+req.body.leistungsebene+" gefunden werden."))
            }else{
              db.query(
                "INSERT INTO `selg_schema`.`bewertungen_db` "
                + "(`schueler_id`, `kurs_id`, `lehrer_id`, `date`,`schueler_name`, `kurs_name`, `leistungsebene`, `kommentar`,"
                + "`soz_1`, `soz_2`, `soz_3`, `soz_4_1`, `soz_4_2`," 
                + "`lear_1`, `lear_2`, `lear_3`, `lear_4`, `lear_5`, `lear_6`, `lear_7`, `lear_8_1`, `lear_8_2`, `lear_9`,"
                + "`k_1`, `k_2`, `k_3`, `k_4`, `k_5`, `k_6`, `k_7`, `k_8`, `k_9`, `k_10`, `k_11`, `k_12`, `k_13`, `k_14`, `k_15`) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
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
                          
                          
                          res.redirect("/kurs/"+req.body.kurs_id);
                          
                        }
                      }
                    );
                  }
                }
              );
            }
          });
      }});
    }
  }
});

router.get("/neu", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false,
    location: "Neue Bewertung"
  };

  
  handlebars_presettings.autocomplete_names = [];
  handlebars_presettings.autocomplete_faecher = [];

  const db = require("../db");
  db.query("SELECT * from schueler_db WHERE id IN (SELECT id_schueler FROM schueler_kurs_link WHERE id_kurs IN (SELECT id FROM kurs_db WHERE lehrer_id = ?))",[res.locals.user_id], (err, result) => {
    if(err) return next(new Error(err.message));

    var autocomplete_schueler_lsit = {};

    result.forEach(Schueler => {
      if(autocomplete_schueler_lsit[Schueler.name] === undefined){ 
        autocomplete_schueler_lsit[Schueler.name] = 1;
        handlebars_presettings.autocomplete_names.push(Schueler.name);
      }
    });
    res.locals.meineKurse.forEach(Kurs => {
      handlebars_presettings.autocomplete_faecher.push(Kurs.name+" "+Kurs.leistungsebene);
    });
    res.render("bewertungen/neue_bewertung_manuell", handlebars_presettings)
  });
    
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
          res.download(file, "SELG-Protokoll-"+bewertung_presetting[0].schueler_name.split(" ")[0]+"-"+bewertung_presetting[0].schueler_name.split(" ")[1]+".pdf", (err) => {
            if(err) return next(new Error(err.message));
            fs.unlink(__dirname+"/SELG-Protokoll-"+bewertung_presetting[0].schueler_name.split(" ")[0]+"-"+bewertung_presetting[0].schueler_name.split(" ")[1]+".pdf",function(err){
              if(err) return next(new Error(err.message));
              console.log('\tEine Bewertung von '+bewertung_presetting[0].schueler_name.split(" ")[0]+"-"+bewertung_presetting[0].schueler_name.split(" ")[1]+' wurde erfolgreich exportiert und wieder gelöscht');
            });  
          }); 
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
    id: req.params.id
  };


  db.query("SELECT * FROM bewertungen_db WHERE id = ?", [req.params.id], function(    err,    result  ) {
    if (err || result.length == 0) {
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

router.get("/view_sumup=:schuelerid", function(req, res, next){

  // @TODO schauen ob der Schüler in der Klasse ist

  db.query("SELECT * FROM bewertungen_db WHERE schueler_id = ?", [req.params.schuelerid], (err, result) => {
    if(err || result.length === 0) return next(new Error(""));
    
    // Ein Blueprint der Zusammenfassung wird erstellt.
    var sumup = {
      // Für Handlebars
        layout: res.locals.permission,
        location: "Bewertung ansehen",
      // Für den Durchschnitt 
        schueler_id: req.params.schuelerid,
        stufe: res.locals.stufe,
        suffix: res.locals.stufe_suffix,
        date: datetime.create().format("d.m.Y"),
        schueler_name: result[0].schueler_name,
        soz_1: result[0].soz_1,
        soz_2: result[0].soz_1,
        soz_3: result[0].soz_1,
        soz_4: result[0].soz_1,
        soz_5_1: result[0].soz_1,
        soz_5_2: result[0].soz_1,
        soz_6: result[0].soz_1,
        lear_1: result[0].soz_1,
        lear_2: result[0].soz_1,
        lear_3: result[0].soz_1,
        lear_4: result[0].soz_1,
        lear_5: result[0].soz_1,
        lear_6: result[0].soz_1,
        lear_7: result[0].soz_1,
        lear_8: result[0].soz_1,
        lear_9_1: result[0].soz_1,
        lear_9_2: result[0].soz_1,
        lear_9_3: result[0].soz_1,
        lear_10: result[0].soz_1,
      // Um alle Kommentare zusammen zu fassen:
        k_1: [],
        k_2: [],
        k_3: [],
        k_4: [],
        k_5_1: [],
        k_5_2: [],
        k_6: [],
        k_7: [],
        k_8: [],
        k_9: [],
        k_10: [],
        k_11: [],
        k_12: [],
        k_13: [],
        k_14: [],
        k_15: [],
        k_16: [],
        k_17: [],
        k_18: [],
        kommentar: []
    };
 
    var bewertungs_count = 1;

    // Alle Bewertungen werden aufaddiert
    for(var i = 1; i < result.length; i++){
      sumup.soz_1 +=     result[i].soz_1 ;
      sumup.soz_2 +=     result[i].soz_2 ;
      sumup.soz_3 +=     result[i].soz_3 ;
      sumup.soz_4 +=     result[i].soz_4 ;
      sumup.soz_5_1 +=   result[i].soz_5_1;
      sumup.soz_5_2 +=   result[i].soz_5_2;
      sumup.soz_6 +=     result[i].soz_6 ;
      sumup.lear_1 +=    result[i].lear_1;
      sumup.lear_2 +=    result[i].lear_2;
      sumup.lear_3 +=    result[i].lear_3;
      sumup.lear_4 +=    result[i].lear_4;
      sumup.lear_5 +=    result[i].lear_5;
      sumup.lear_6 +=    result[i].lear_6;
      sumup.lear_7 +=    result[i].lear_7;
      sumup.lear_8 +=    result[i].lear_8;
      sumup.lear_9_1 +=  result[i].lear_9_1;
      sumup.lear_9_2 +=  result[i].lear_9_2;
      sumup.lear_9_3 +=  result[i].lear_9_3;
      sumup.lear_10 +=   result[i].lear_10;

      bewertungs_count++;
    }

    // Addiert alle Kommentart
    for(var i = 0; i < result.length; i++){
      if(result[i].k_1   !== null && result[i].k_1   !== undefined) sumup.k_1.push(result[i].k_1);
      if(result[i].k_2   !== null && result[i].k_2   !== undefined) sumup.k_2.push(result[i].k_2); 
      if(result[i].k_3   !== null && result[i].k_3   !== undefined) sumup.k_3.push(result[i].k_3); 
      if(result[i].k_4   !== null && result[i].k_4   !== undefined) sumup.k_4.push(result[i].k_4); 
      if(result[i].k_5_1 !== null && result[i].k_5_1 !== undefined) sumup.k_5_1.push(result[i].k_5_1);
      if(result[i].k_5_2 !== null && result[i].k_5_2 !== undefined) sumup.k_5_2.push(result[i].k_5_2);
      if(result[i].k_6   !== null && result[i].k_6   !== undefined) sumup.k_6.push(result[i].k_6); 
      if(result[i].k_7   !== null && result[i].k_7   !== undefined) sumup.k_7.push(result[i].k_7); 
      if(result[i].k_8   !== null && result[i].k_8   !== undefined) sumup.k_8.push(result[i].k_8); 
      if(result[i].k_9   !== null && result[i].k_9   !== undefined) sumup.k_9.push(result[i].k_9); 
      if(result[i].k_10  !== null && result[i].k_10  !== undefined) sumup.k_10.push(result[i].k_10);
      if(result[i].k_11  !== null && result[i].k_11  !== undefined) sumup.k_11.push(result[i].k_11);
      if(result[i].k_12  !== null && result[i].k_12  !== undefined) sumup.k_12.push(result[i].k_12);
      if(result[i].k_13  !== null && result[i].k_13  !== undefined) sumup.k_13.push(result[i].k_13);
      if(result[i].k_14  !== null && result[i].k_14  !== undefined) sumup.k_14.push(result[i].k_14);
      if(result[i].k_15  !== null && result[i].k_15  !== undefined) sumup.k_15.push(result[i].k_15);
      if(result[i].k_16  !== null && result[i].k_16  !== undefined) sumup.k_16.push(result[i].k_16);
      if(result[i].k_17  !== null && result[i].k_17  !== undefined) sumup.k_17.push(result[i].k_17);
      if(result[i].k_18  !== null && result[i].k_18  !== undefined) sumup.k_18.push(result[i].k_18);
      if(result[i].kommentar  !== null && result[i].kommentar  !== undefined && result[i].kommentar.length  !== 0) sumup.kommentar.push(result[i].kurs_name+" "+result[i].leistungsebene+": "+result[i].kommentar);
      
    }
    // Der Durchschnitt wird gebildet und auf ganez Zahlen gerundet.
    sumup.soz_1     = Math.round(sumup.soz_1    / bewertungs_count);  
    sumup.soz_2     = Math.round(sumup.soz_2    / bewertungs_count); 
    sumup.soz_3     = Math.round(sumup.soz_3    / bewertungs_count);
    sumup.soz_4     = Math.round(sumup.soz_4    / bewertungs_count); 
    sumup.soz_5_1   = Math.round(sumup.soz_5_1  / bewertungs_count);
    sumup.soz_5_2   = Math.round(sumup.soz_5_2  / bewertungs_count);
    sumup.soz_6     = Math.round(sumup.soz_6    / bewertungs_count);
    sumup.lear_1    = Math.round(sumup.lear_1   / bewertungs_count);
    sumup.lear_2    = Math.round(sumup.lear_2   / bewertungs_count);
    sumup.lear_3    = Math.round(sumup.lear_3   / bewertungs_count);
    sumup.lear_4    = Math.round(sumup.lear_4   / bewertungs_count);
    sumup.lear_5    = Math.round(sumup.lear_5   / bewertungs_count);
    sumup.lear_6    = Math.round(sumup.lear_6   / bewertungs_count);
    sumup.lear_7    = Math.round(sumup.lear_7   / bewertungs_count);
    sumup.lear_8    = Math.round(sumup.lear_8   / bewertungs_count);
    sumup.lear_9_1  = Math.round(sumup.lear_9_1 / bewertungs_count);
    sumup.lear_9_2  = Math.round(sumup.lear_9_2 / bewertungs_count);
    sumup.lear_9_3  = Math.round(sumup.lear_9_3 / bewertungs_count);
    sumup.lear_10   = Math.round(sumup.lear_10  / bewertungs_count);


    /* @TODO Anderes Template benutzen und Kommentare anders anzeigen
     * Fach und Leistunsebene wegmachen, dafür Datum und Klasse
     *
    */
    res.render("bewertungen/view_sumup", sumup)

  });
});

router.get("/download_sumup=:schuelerid", function(req, res, next){
  // TODO schauen ob der Schüler Bewertungen in jedem Kurs erhalten hat (Bsp: 10/12 Bewertungen wurden abgegeben);

  if(res.locals.permission !== "tutor") return next(new Error("Diese Funktion können nur Tutoren einer Klasse nutzen."));

  db.query("SELECT stufe, klassen_suffix FROM schueler_db WHERE id = ?", [req.params.schuelerid], (err, result)=>{
    if(result[0].stufe === res.locals.stufe && result[0].klassen_suffix === res.locals.stufe_suffix){
      
    

    // req.params.schuelerid

    db.query("SELECT * FROM bewertungen_db WHERE schueler_id = ?", [req.params.schuelerid], (err, result) => {
      if(err || result.length === 0) return next(new Error("Leider konnte diese Bewertung nicht heruntergeladen werden. Wurden schon alle Bewertungen abgegeben?"));

      // Ein BLueprint der Zusammenfassung wird erstellt.
      var sumup = {
        isSumUp: true,
        schueler_id: req.params.schuelerid,
        stufe: res.locals.stufe,
        suffix: res.locals.stufe_suffix,
        date: datetime.create().format("d.m.Y"),
        schueler_name: result[0].schueler_name,
        soz_1: result[0].soz_1,
        soz_2: result[0].soz_1,
        soz_3: result[0].soz_1,
        soz_4: result[0].soz_1,
        soz_5_1: result[0].soz_1,
        soz_5_2: result[0].soz_1,
        soz_6: result[0].soz_1,
        lear_1: result[0].soz_1,
        lear_2: result[0].soz_1,
        lear_3: result[0].soz_1,
        lear_4: result[0].soz_1,
        lear_5: result[0].soz_1,
        lear_6: result[0].soz_1,
        lear_7: result[0].soz_1,
        lear_8: result[0].soz_1,
        lear_9_1: result[0].soz_1,
        lear_9_2: result[0].soz_1,
        lear_9_3: result[0].soz_1,
        lear_10: result[0].soz_1,
      };

      if(req.query.date) sumup.date = req.query.date;

      var bewertungs_count = 1;

      // Alle Bewertungen werden aufaddiert
      for(var i = 1; i < result.length; i++){
        sumup.soz_1 +=     result[i].soz_1 ;
        sumup.soz_2 +=     result[i].soz_2 ;
        sumup.soz_3 +=     result[i].soz_3 ;
        sumup.soz_4 +=     result[i].soz_4 ;
        sumup.soz_5_1 +=   result[i].soz_5_1;
        sumup.soz_5_2 +=   result[i].soz_5_2;
        sumup.soz_6 +=     result[i].soz_6 ;
        sumup.lear_1 +=    result[i].lear_1;
        sumup.lear_2 +=    result[i].lear_2;
        sumup.lear_3 +=    result[i].lear_3;
        sumup.lear_4 +=    result[i].lear_4;
        sumup.lear_5 +=    result[i].lear_5;
        sumup.lear_6 +=    result[i].lear_6;
        sumup.lear_7 +=    result[i].lear_7;
        sumup.lear_8 +=    result[i].lear_8;
        sumup.lear_9_1 +=  result[i].lear_9_1;
        sumup.lear_9_2 +=  result[i].lear_9_2;
        sumup.lear_9_3 +=  result[i].lear_9_3;
        sumup.lear_10 +=   result[i].lear_10;
        bewertungs_count++;
      }

      // Der Durchschnitt wird gebildet und auf ganez Zahlen gerundet.
      sumup.soz_1     = Math.round(sumup.soz_1    / bewertungs_count);  
      sumup.soz_2     = Math.round(sumup.soz_2    / bewertungs_count); 
      sumup.soz_3     = Math.round(sumup.soz_3    / bewertungs_count);
      sumup.soz_4     = Math.round(sumup.soz_4    / bewertungs_count); 
      sumup.soz_5_1   = Math.round(sumup.soz_5_1  / bewertungs_count);
      sumup.soz_5_2   = Math.round(sumup.soz_5_2  / bewertungs_count);
      sumup.soz_6     = Math.round(sumup.soz_6    / bewertungs_count);
      sumup.lear_1    = Math.round(sumup.lear_1   / bewertungs_count);
      sumup.lear_2    = Math.round(sumup.lear_2   / bewertungs_count);
      sumup.lear_3    = Math.round(sumup.lear_3   / bewertungs_count);
      sumup.lear_4    = Math.round(sumup.lear_4   / bewertungs_count);
      sumup.lear_5    = Math.round(sumup.lear_5   / bewertungs_count);
      sumup.lear_6    = Math.round(sumup.lear_6   / bewertungs_count);
      sumup.lear_7    = Math.round(sumup.lear_7   / bewertungs_count);
      sumup.lear_8    = Math.round(sumup.lear_8   / bewertungs_count);
      sumup.lear_9_1  = Math.round(sumup.lear_9_1 / bewertungs_count);
      sumup.lear_9_2  = Math.round(sumup.lear_9_2 / bewertungs_count);
      sumup.lear_9_3  = Math.round(sumup.lear_9_3 / bewertungs_count);
      sumup.lear_10   = Math.round(sumup.lear_10  / bewertungs_count);

      var bewertung_presetting = [];
          bewertung_presetting[0] = sumup;    
      const pdf = require('phantom-html2pdf');
      const Handlebars = require('handlebars');
      const fs = require('fs');

      // Ein helper welcher es HBS erlaubt Werte zu vergleichen.
      Handlebars.registerHelper('ifEqual', function(a, b, opts) {
        if(a == b)
            return opts.fn(this);
        else
            return opts.inverse(this);
      });

      // Das HBS-Template für eine Bewertung wird geladen.
      // Über das bewertung_presetting[0] objekt wird das Template dann gerendert und zu einer PDF
      // Option gemacht.
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
        // Wenn die pdfOptions erstellt wurden, wird das Dokument temporär gespeichert und dem Benutzer als Downlaod geschickt.
        // Wenn der Download erfolgreich war, wird das Dokument wieder gelöscht
        pdf.convert(pdfOptions, function(err, result) {
          result.toFile(__dirname+"/SELG-Protokoll-"+bewertung_presetting[0].schueler_name.split(" ")[0]+"-"+bewertung_presetting[0].schueler_name.split(" ")[1]+".pdf", function() {
            var file =__dirname+"/SELG-Protokoll-"+bewertung_presetting[0].schueler_name.split(" ")[0]+"-"+bewertung_presetting[0].schueler_name.split(" ")[1]+".pdf";
            res.download(file, "SELG-Protokoll-"+bewertung_presetting[0].schueler_name.split(" ")[0]+"-"+bewertung_presetting[0].schueler_name.split(" ")[1]+".pdf", (err) => {
              if(err) return next(new Error(err.message));
              fs.unlink(__dirname+"/SELG-Protokoll-"+bewertung_presetting[0].schueler_name.split(" ")[0]+"-"+bewertung_presetting[0].schueler_name.split(" ")[1]+".pdf",function(err){
                if(err) return next(new Error(err.message));
                console.log('\tEine Bewertung von '+bewertung_presetting[0].schueler_name.split(" ")[0]+"-"+bewertung_presetting[0].schueler_name.split(" ")[1]+' wurde erfolgreich exportiert und wieder gelöscht');
              });  
            }); 
          });
        });
      });
    });
    }else{
      return next(new Error("Wir konnten diesen Schüler nicht in Ihrer Klasse finden."))
    } 
  });
});



router.get("/edit=:bewertungsid" , function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false,
    location: "Bewertung bearbeiten"
  };  

  // Schauen ob man überhaupt eine Bewertung schreiben darf

  // Schülerinformationen
  db.query("SELECT * FROM bewertungen_db WHERE id = ?", [req.params.bewertungsid], (err, presetting) => {

    if(err || presetting.length == 0) return next(new Error("Die Bewertung konnte nicht gefunden werden."));
    if(presetting[0].lehrer_id != res.locals.user_id) return next(new Error("Die Bewertung konnte nicht gefunden werden."));

    // Fügt zum Presetting-Object alle Daten der Bewertung hinzu
    for(var key in presetting[0]){handlebars_presettings[key] = presetting[0][key];}

    handlebars_presettings.bewertungs_id = req.params.bewertungsid;

    res.render("bewertungen/edit", handlebars_presettings);
  });
});

router.post("/edit", function(req, res, next){

  var insert_array =
  [
    datetime.create().format("d.m.Y") , req.body.kommentar,
    req.body.soz_1,req.body.soz_2,req.body.soz_3,req.body.soz_4_1,req.body.soz_4_2,
    req.body.lernab_1,req.body.lernab_2,req.body.lernab_3,req.body.lernab_4,req.body.lernab_5,req.body.lernab_6,req.body.lernab_7,req.body.lernab_8_1,req.body.lernab_8_2,req.body.lernab_9,
    req.body.kommentar_1,req.body.kommentar_2,req.body.kommentar_3,req.body.kommentar_4,req.body.kommentar_5,req.body.kommentar_6,req.body.kommentar_7,req.body.kommentar_8,req.body.kommentar_9,req.body.kommentar_10,req.body.kommentar_11,req.body.kommentar_12,req.body.kommentar_13,req.body.kommentar_14,req.body.kommentar_15,
    req.body.bewertungs_id
  ];

  console.log(insert_array);


  db.query("UPDATE `selg_schema`.`bewertungen_db` SET `date` = ?, `kommentar` = ? , `soz_1` = ?, `soz_2` = ?, `soz_3` = ?, `soz_4_1` = ?, `soz_4_2` = ?, `lear_1` = ?, `lear_2` = ?, `lear_3` = ?, `lear_4` = ?, `lear_5` = ?, `lear_6` = ?, `lear_7` = ?, `lear_8_1` = ?, `lear_8_2` = ?, `lear_9` = ?,"
          +"`k_1` = ?, `k_2` = ?, `k_3` = ?, `k_4` = ?, `k_5` = ?, `k_6` = ?, `k_7` = ?, `k_8` = ?, `k_9` = ?, `k_10` = ?, `k_11` = ?, `k_12` = ?, `k_13` = ?, `k_14` = ?, `k_15` = ? WHERE (`id` = ?);",
  insert_array,
  (err, result)=>{
    if(err) return next(new Error(err.message));
    console.log(result);
    res.redirect("/bewertung/view="+req.body.bewertungs_id);
  });
});

router.get("/meine", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false,
    location: "Neue Bewertung"
  };  

  db.query("SELECT * FROM bewertungen_db WHERE lehrer_id = ? ORDER BY date DESC", [res.locals.user_id], (err, result)=>{
    if (err) return next(new Error(""));
    handlebars_presettings.kurse = result;
    res.render("bewertungen/meine", handlebars_presettings);
  

  });
    
});

module.exports = router;