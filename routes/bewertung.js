var express = require("express");
var router = express.Router();

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

module.exports = router;
