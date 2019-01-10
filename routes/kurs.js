var express = require("express");
var router = express.Router();
var datetime = require("node-datetime");
var db = require("../db");
var async = require("async");
/* Rendert die Seite für einen Kurs */
router.get("/:kursid", function(req, res, next) {
  var kursid = req.params.kursid;

  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false
  };


  var Schueler = [];
  var db = require("../db.js");
  db.query("SELECT * FROM kurs_db WHERE id = ?", [kursid], function(
    err,
    result
  ) {
    if (err || result[0] === undefined) {
      return next(new Error("Diesen Kurs gibt es leider nicht..."));
    }else if(result[0].lehrer_id != res.locals.user_id){
      return next(new Error("Sie haben leider keine Berechtigung diesen Kurs zu sehen..."));
    }else {
      // Kurs gefunden result[0].id = Kurs Id
      handlebars_presettings.kurs = result[0];
      handlebars_presettings.location = "Meine Kurse / "+result[0].name;
      handlebars_presettings.kursname = result[0].name;
      db.query(
        "SELECT * FROM schueler_kurs_link WHERE id_kurs = ?",
        [handlebars_presettings.kurs.id],
        function(err, result) {
          if (err) {
            return next(new Error("Diesen Kurs gibt es leider nicht..."));
          } else {
            async.each(
              result,
              // 2nd param is the function that each item is passed to
              function(item, callback) {
                // Call an asynchronous function, often a save() to DB
                db.query(
                  "SELECT * FROM schueler_db WHERE id = ?",
                  [item.id_schueler],
                  function(err, result) {
                    if (err) {
                      return next(new Error(err.message));
                    } else {
                      Schueler.push(result);
                      callback();
                    }
                  }
                );
              },
              // 3rd param is the function to call when everything's done
              function(err) {
                handlebars_presettings.schueler = Schueler;
                res.render("kurse/fachlehrer", handlebars_presettings);
              }
            );
          }
        }
      );
    }
  });
});

module.exports = router;
