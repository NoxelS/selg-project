var express = require("express");
var router = express.Router();

/* GET Login page. */
router.get("/", function(req, res, next) {
  var handlebars_presettings = {
    layout: false,
    title: "Login",
    display_name: null,
    main_index: false,
    location: "Login"
  };
  res.render("login", handlebars_presettings);
});

router.post("/", function(req, res, next) {
    var handlebars_presettings = {
        title: "Login",
        display_name: null,
        main_index: false,
        location: "Login",
        loggedin: true,
        name: req.body.username
      };

    console.log("POST LOGIN");
    res.render("loginold", handlebars_presettings);
    // @TODO
});

module.exports = router;