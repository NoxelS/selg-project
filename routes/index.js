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

  res.render("index", handlebars_presettings);
});

// DEBUG

router.get("/generate_error", function(req, res, next) {
  res.render("generate_error");
});

module.exports = router;
