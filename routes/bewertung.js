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
    location: "Neue Bewertung"
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
            handlebars_presettings.leistungsebene = "n/a";
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

  if (Object.keys(req.body).length == 0 /* @TODO */) {
    handlebars_presettings.missing_value = true;
    res.render("neue_bewertung", handlebars_presettings);
  } else {
    console.log(
      [
        datetime.create().format("m/d/Y H:M:S"),
        ": [ NEUE BEWERTUNG ] -> ",
        JSON.stringify(req.body)
      ].join("")
    );

    res.render("bewertung_test", handlebars_presettings);
  }
});

module.exports = router;
