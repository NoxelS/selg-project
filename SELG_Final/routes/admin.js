var express = require("express");
var router = express.Router();

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
          console.log(result);
        }
      );
    });
    res.redirect("/admin");
    // @TODO
  }
});

module.exports = router;
