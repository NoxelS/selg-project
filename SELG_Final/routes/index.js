var express = require('express');
var router = express.Router();
var session = require('express-session');

// middleware function to check for logged-in users

/* GET home page. */
router.get('/name', function(req, res, next) {
  var handlebars_presettings = {
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: false,
    location: "Übersicht"  
  }
  res.render('indexs', handlebars_presettings);
});

router.get('/',function(req, res, next) {
  console.log(JSON.stringify(req.session));
  var handlebars_presettings = {
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: true,
    location: "Übersicht"  
  }

  res.render('index', handlebars_presettings);
});



module.exports = router;
