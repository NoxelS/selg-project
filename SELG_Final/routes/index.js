var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/name', function(req, res, next) {
  var handlebars_presettings = {
    title: "SELG-Tool",
    display_name: req.params.name,
    main_index: false,
    location: "Übersicht"  
  }
  res.render('indexs', handlebars_presettings);
});

router.get('/', function(req, res, next) {
  var handlebars_presettings = {
    title: "SELG-Tool",
    display_name: req.params.name,
    main_index: false,
    location: "Übersicht"  
  }

  res.render('index', handlebars_presettings);
});



module.exports = router;
