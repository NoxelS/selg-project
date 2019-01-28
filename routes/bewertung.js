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

  if (Object.keys(req.body).length == 99 /* @TODO */) {
    // @TODO
    handlebars_presettings.missing_value = "Bitte füllen Sie alle Felder aus!";
    res.render("neue_bewertung", handlebars_presettings);

  } else {
    
    var insert_array =
    [
      req.body.schueler_id, req.body.kurs_id, req.body.name, req.body.fach, req.body.leistungsebene, req.body.kommentar,
      req.body.soz_1,req.body.soz_2,req.body.soz_3,req.body.soz_4,req.body.soz_5_1,req.body.soz_5_2,req.body.soz_6,
      req.body.lernab_1,req.body.lernab_2,req.body.lernab_3,req.body.lernab_4,req.body.lernab_5,req.body.lernab_6,req.body.lernab_7,req.body.lernab_8,req.body.lernab_9_1,req.body.lernab_9_2,req.body.lernab_9_3,req.body.lernab_10,
      req.body.kommentar_1,req.body.kommentar_2,req.body.kommentar_3,req.body.kommentar_4,req.body.kommentar_5,req.body.kommentar_6,req.body.kommentar_7,req.body.kommentar_8,req.body.kommentar_9,req.body.kommentar_10,req.body.kommentar_11,req.body.kommentar_12,req.body.kommentar_13,req.body.kommentar_14,req.body.kommentar_15,req.body.kommentar_16,req.body.kommentar_17,req.body.kommentar_18
    ];
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
console.log(req.body)

    db.query(
      "INSERT INTO `selg_schema`.`bewertungen_db` "
      + "(`schueler_id`, `kurs_id`, `schueler_name`, `kurs_name`, `leistungsebene`, `kommentar`,"
      + "`soz_1`, `soz_2`, `soz_3`, `soz_4`, `soz_5_1`, `soz_5_2`, `soz_6`," 
      + "`lear_1`, `lear_2`, `lear_3`, `lear_4`, `lear_5`, `lear_6`, `lear_7`, `lear_8`, `lear_9_1`, `lear_9_2`, `lear_9_3`, `lear_10`, "
      + "`k_1`, `k_2`, `k_3`, `k_4`, `k_5`, `k_6`, `k_7`, `k_8`, `k_9`, `k_10`, `k_11`, `k_12`, `k_13`, `k_14`, `k_15`, `k_16`, `k_17`, `k_18`) "
      + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
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
                res.redirect("/");
              }
            }
          );
        }
      }
    );
  }
});

module.exports = router;

//res.render("bewertung_test", handlebars_presettings);
