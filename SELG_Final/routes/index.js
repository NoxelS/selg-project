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

router.get('/', function(req, res, next) {

  console.log(req.user);
  console.log(req.isAuthenticated());
  console.log(JSON.stringify(req.session));
  var handlebars_presettings = {
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: true,
    location: "Übersicht"  
  }

  res.render('index', handlebars_presettings);
});

function authenticationMiddleware() {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
}

module.exports = router;
