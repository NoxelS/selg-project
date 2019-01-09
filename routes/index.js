var express = require("express");
var router = express.Router();
var session = require("express-session");

/* GET home page. */
router.get("/", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: true,
    location: "Übersicht"
  };
  if (res.locals.permission === "admin") {
    handlebars_presettings.user_count = 0;

    // @TODO ASYNC

    var db = require("../db.js");
    db.query("SELECT MAX(ID) AS LastID FROM user_db", function(err, result) {
      if (err) console.log(err);
      handlebars_presettings.user_count = result[0].LastID;
      db.query("SELECT MAX(ID) AS LastID FROM schueler_db", function(err, result) {
        if (err) console.log(err)
        handlebars_presettings.schueler_count = result[0].LastID;
        res.render("index_admin", handlebars_presettings);
      });
    });
  } else {
    res.render("index", handlebars_presettings);
  }
});

/* GET Profile page. */
router.get("/profil", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: res.locals.username,
    icon_cards: false,
    location: "Profil"
  };

  res.render("profile", handlebars_presettings);
});

/* GET Settings page. */
router.get("/einstellungen", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: res.locals.username,
    icon_cards: false,
    location: "Einstellungen"
  };

  res.render("einstellungen", handlebars_presettings);
});
// DEBUG

router.get("/generate_error", function(req, res, next) {
  res.render("generate_error");
});

module.exports = router;
