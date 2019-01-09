var express = require("express");
var router = express.Router();
var datetime = require("node-datetime");
var db = require("../db");
/* Rendert die Seite für einen Kurs */
router.get("/:kursname", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false,
    location: kursname,
    kursname: kursname
  };

  var kursname = req.params.kursname;

  var db = require("../db.js");
  db.query("SELECT * FROM kurs_db WHERE name = ?", [kursname], function(err, result) {
    if (err) {
      return next(new Error("Diesen Kurs gibt es leider nicht..."));
    } else {
        handlebars_presettings.kurs = result[0];
        res.render("kurse/fachlehrer", handlebars_presettings);
    }
  });
});

module.exports = router;
