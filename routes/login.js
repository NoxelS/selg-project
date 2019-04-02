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
    location: "Login",
    failedLogin: req.query.failed === undefined ? false : true
  };

  if(res.locals.permission){
    res.redirect('/');
  }else{
    res.render("login/login", handlebars_presettings);
  }
});

/* GET Recovery page. */
router.get("/recovery", function(req, res, next) {
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
    res.render("login/recovery", handlebars_presettings);
  }
});

/* GET Recovery success page. */
router.get("/recovery_sucess", function(req, res, next) {
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
    res.render("login/recovery_sucess", handlebars_presettings);
  }
});

/* Post Recover page. */
router.post("/recovery", function(req, res, next) {
  var handlebars_presettings = {
    layout: false,
    title: "Login",
    display_name: null,
    icon_cards: false,
    location: "Login",
    email: req.body.email
  };

  res.render("login/recovery_sucess", handlebars_presettings);
});


// login request POST
router.post("/", passport.authenticate(
  'local', {
    successRedirect: '/',
    failureRedirect: '/login?failed=true'
  }));

module.exports = router;
