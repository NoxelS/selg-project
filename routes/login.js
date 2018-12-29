var express = require("express");
var router = express.Router();
var passport = require('passport');

/* GET Login page. */
router.get("/", function(req, res, next) {
  var handlebars_presettings = {
    layout: false,
    title: "Login",
    display_name: null,
    icon_cards: false,
    location: "Login"
  };

  if(res.locals.permission){
    res.redirect('/');
  }else{
    res.render("login", handlebars_presettings);
  }
});

router.post("/", passport.authenticate(
  'local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

module.exports = router;
