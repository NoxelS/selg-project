var express = require("express");
var router = express.Router();
var datetime = require("node-datetime");

/* GET rating page. */
router.get("/neu", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false,
    location: "Neue Bewertung"
  };

  res.render("neue_bewertung", handlebars_presettings);
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
          ": [ NEUE BEWERTUNG ] -> ",JSON.stringify(req.body)].join(""));

    res.render("bewertung_test", handlebars_presettings);
  }
});

module.exports = router;
