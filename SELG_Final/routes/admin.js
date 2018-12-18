var express = require("express");
var router = express.Router();

var passport = require('passport');

var bcrypt = require("bcrypt");
const saltRounds = 10;

/* GET Login page. */
router.get("/", function(req, res, next) {
  var handlebars_presettings = {
    layout: false,
    title: "Login",
    display_name: null,
    icon_cards: false,
    location: "Login"
  };
  res.render("create_admin", handlebars_presettings);
});

router.post("/create/user", function(req, res, next) {
  req.checkBody("username", "Ein Benutzername ist notwendig!").isLength(3, 15);

  if (req.validationErrors()) {
    console.log("Denied Creation");
  } else {
    const username = req.body.username;
    const password = req.body.password;
    const permission_flag = req.body.permission_flag.toLowerCase();

    var db = require("../db.js");

    bcrypt.hash(password, saltRounds, function(err, hash) {
      db.query(
        "INSERT INTO `selg_schema`.`user_db` (`username`, `password`, `permission_flag`) VALUES (?, ?, ?)",
        [username, hash, permission_flag],
        function(err, result, fields) {
          if (err) throw err;
          db.query('SELECT LAST_INSERT_ID() as user_id', (error, results, fields) => {
            if (error) throw error;

            //user_id = results[0]

            req.login(results[0], (err) => {
              res.redirect("/")
            });
            console.log(results[0]);

          });

        }
      );
    });
  }
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

module.exports = router;
