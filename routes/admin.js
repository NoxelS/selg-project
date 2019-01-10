var express = require("express");
var router = express.Router();
var datetime = require("node-datetime");
var passport = require("passport");

var bcrypt = require("bcrypt");
const saltRounds = 10;

function userHasAdminPermission() {
  return (req, res, next) => {
    if (res.locals.permission === "admin") return next();
    res.redirect("/");
  };
}

/* Create Kurs Route. */
router.get("/create_kurs", userHasAdminPermission(), function(req, res, next) {
  var handlebars_presettings = {
    layout: "admin",
    title: "SELG-Admintool",
    display_name: null,
    icon_cards: false,
    location: "Kurs erstellen"
  };
  res.render("create/kurs", handlebars_presettings);
});

router.post("/create_kurs", userHasAdminPermission(), function(req, res, next) {
    const stufe = req.body.stufe;
    const fach = req.body.fach;
    const leistungsebene = req.body.leistungsebene;
    const lehrer_username = req.body.username;

    var db = require("../db");

    // Zugehörigen Lehrer finden
    db.query("SELECT * FROM user_db WHERE username = ?;",
    [lehrer_username],
    function(err, result) {
      if (err) {
        return next(new Error(err.message));
      } else if(result.length == 0){
        return next(new Error("Diesen Lehrer gibt es nicht..."));
      }else{
        // Wenn der Leher gefunden wurde:
 
        db.query("INSERT INTO `selg_schema`.`kurs_db` (`name`, `lehrer_name`, `lehrer_id`, `type`, `jahrgang`, `leistungsebene`) VALUES (?, ?, ?, ?, ?, ?);",
        [fach.toLowerCase(), result[0].username, result[0].id, fach.toLowerCase(), stufe, leistungsebene],
        function(err, result) {
          if (err) {
            return next(new Error(err.message));
          } else {
            res.redirect("/");
          }
        });


      }
    });
});



/* Create User Route. */
router.get("/create_user", userHasAdminPermission(), function(req, res, next) {
  var handlebars_presettings = {
    layout: "admin",
    title: "SELG-Admintool",
    display_name: null,
    icon_cards: false,
    location: "Benutzer erstellen"
  };
  res.render("benutzer_create", handlebars_presettings);
});

router.post("/create_user", userHasAdminPermission(), function(req, res, next) {
  req.checkBody("username", "Ein Benutzername ist notwendig!").isLength(3, 15);
  if (!req.validationErrors()) {
    const username = req.body.username;
    const password = req.body.password;
    var permission_flag = "";

    switch (req.body.permission_flag.toLowerCase()) {
      case "administrator":
        permission_flag = "admin";
        break;
      case "tutor":
        permission_flag = "tutor";
        break;
      case "fachlehrer":
        permission_flag = "fachlehrer";
        break;
    }

    var db = require("../db.js");
    bcrypt.hash(password, saltRounds, function(err, hash) {
      db.query(
        "INSERT INTO `selg_schema`.`user_db` (`username`, `password`, `permission_flag`) VALUES (?, ?, ?)",
        [username, hash, permission_flag],
        function(err, result, fields) {
          if (err) {
            res.locals.message = err.message;
            res.locals.error = err;

            // render the error page
            res.status(err.status || 500);

            var handlebars_presettings = {
              layout: res.locals.permission,
              title: "SELG-Tool",
              display_name: req.params.name,
              icon_cards: false,
              location: "Error"
            };

            res.render("error", handlebars_presettings);
          } else {
            db.query(
              "SELECT LAST_INSERT_ID() as user_id",
              (error, results, fields) => {
                if (error) {
                  res.locals.message = err.message;
                  res.locals.error = err;

                  // render the error page
                  res.status(err.status || 500);

                  var handlebars_presettings = {
                    layout: res.locals.permission,
                    title: "SELG-Tool",
                    display_name: req.params.name,
                    icon_cards: false,
                    location: "Error",
                    error: {
                      message: "An SQL Error occured..."
                    }
                  };

                  res.render("error", handlebars_presettings);
                }
                //user_id = results[0]
                /* @TODO 
              req.login(results[0], err => {
                res.redirect("/");
              });
              */
                res.redirect("/");
                console.log(
                  [
                    datetime.create().format("m/d/Y H:M:S"),
                    ": [ NEW USER CREATED ] -> user_id=",
                    results[0]
                  ].join("")
                );
              }
            );
          }
        }
      );
    });
  }else{
    // @TODO - Invalider Benutzer bzw Fehler beim erstellen
    var handlebars_presettings = {
      layout: "admin",
      title: "SELG-Admintool",
      display_name: null,
      icon_cards: false,
      location: "Benutzer löschen",
      error: {message: "Beim erstellen des Nutzers ist ein Fehler aufgetreten..."}
    };
    res.render("error", handlebars_presettings);
  }
});

/* Edit User Route. */
router.get("/edit_user", userHasAdminPermission(), function(req, res, next) {
  var handlebars_presettings = {
    layout: "admin",
    title: "SELG-Admintool",
    display_name: null,
    icon_cards: false,
    location: "Benutzer bearbeiten"
  };
  res.render("benutzer_edit", handlebars_presettings);
});

/* Delete User Route. */
router.get("/delete_user", userHasAdminPermission(), function(req, res, next) {
  var handlebars_presettings = {
    layout: "admin",
    title: "SELG-Admintool",
    display_name: null,
    icon_cards: false,
    location: "Benutzer löschen"
  };
  res.render("benutzer_delete", handlebars_presettings);
});

/* Create Schueler Route. */
router.get("/create_schueler", userHasAdminPermission(), function(
  req,
  res,
  next
) {
  var handlebars_presettings = {
    layout: "admin",
    title: "SELG-Admintool",
    display_name: null,
    icon_cards: false,
    location: "Schüler erstellen"
  };
  res.render("schueler_create", handlebars_presettings);
});

router.post("/create_schueler", userHasAdminPermission(), function(
  req,
  res,
  next
) {
  // @TODO
  res.redirect("/");
});

/* Edit Schüler Route. */
router.get("/edit_schueler", userHasAdminPermission(), function(
  req,
  res,
  next
) {
  var handlebars_presettings = {
    layout: "admin",
    title: "SELG-Admintool",
    display_name: null,
    icon_cards: false,
    location: "Schüler bearbeiten"
  };
  res.render("schueler_edit", handlebars_presettings);
});

/* Delete Schüler Route. */
router.get("/delete_schueler", userHasAdminPermission(), function(
  req,
  res,
  next
) {
  var handlebars_presettings = {
    layout: "admin",
    title: "SELG-Admintool",
    display_name: null,
    icon_cards: false,
    location: "Schüler löschen"
  };
  res.render("schueler_delete", handlebars_presettings);
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

module.exports = router;
