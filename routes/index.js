var express = require("express");
var router = express.Router();
var session = require("express-session");

// middleware function to check for logged-in users

/* GET home page. */
router.get("/", function(req, res, next) {
  var handlebars_presettings = {
    layout: "",
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: true,
    location: "Übersicht"
  };

  switch (res.locals.permission) {
    case "fachlehrer":
      handlebars_presettings.layout = "layout_fachlehrer";
      break;
    case "tutor":
      handlebars_presettings.layout = "layout_tutor";
      break;
    case "admin":
      handlebars_presettings.layout = "layout_admin";
      break;
  }

  res.render("index", handlebars_presettings);
});





router.get("/name", function(req, res, next) {
  var handlebars_presettings = {
    title: "SELG-Tool",
    display_name: res.locals.username,
    icon_cards: false,
    location: "Übersicht"
  };
  console.log("\r\n");
  console.log(JSON.stringify(res.locals));
  res.render("index", handlebars_presettings);
});

module.exports = router;
