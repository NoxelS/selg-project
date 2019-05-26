var express = require("express");
var router = express.Router();
var datetime = require("node-datetime");
var passport = require("passport");
var path = require("path");
var mime = require("mime");
var fs = require("fs");
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

function genFachName(type) {
  let ret;
  switch (type) {
    case "deutsch":
      ret = "Deutsch";
      break;
    case "englisch":
      ret = "Englisch";
      break;
    case "mathematik":
      ret = "Mathematik";
      break;
    case "gesellschaftslehre":
      ret = "GL";
      break;
    case "musik":
      ret = "Musik";
      break;
    case "bildende_kunst":
      ret = "BK";
      break;
    case "chemie":
      ret = "Chemie";
      break;
    case "biologie":
      ret = "Biologie";
      break;
    case "physik":
      ret = "Physik";
      break;
    case "religion":
      ret = "Religion";
      break;
    case "sport":
      ret = "Sport";
      break;
    case "naturwissenschaften":
      ret = "NAWI";
      break;
    case "sgl":
      ret = "SGL";
      break;
    case "kommunikation_und_medien":
      ret = "Kom&Med";
      break;
    case "oekologie":
      ret = "Ökologie";
      break;
    case "darstellendes_spielen":
      ret = "DS";
      break;
    case "sport_und_gesundheit":
      ret = "Sport&Ges";
      break;
    case "franzoesisch":
      ret = "Französisch";
      break;
    case "technik_und_wirtschaft":
      ret = "Tech&Wirt";
      break;
    case "kunst_und_design":
      ret = "Kunst & Design";
      break;
  }
  return ret;
}
/* Create User Route. */
router.get("/create_user", userHasAdminPermission(), function(req, res, next) {
  var handlebars_presettings = {
    layout: "admin",
    title: "SELG-Admintool",
    icon_cards: false,
    location: "Benutzer erstellen"
  };
  res.render("create/benutzer", handlebars_presettings);
});

router.post("/create_kurs", userHasAdminPermission(), function(req, res, next) {
  const stufe = req.body.stufe;
  const fach = req.body.fach;
  const leistungsebene = req.body.leistungsebene;
  const lehrer_username = req.body.username;

  var db = require("../db");

  // Zugehörigen Lehrer finden
  db.query(
    "SELECT * FROM user_db WHERE username = ?;",
    [lehrer_username],
    function(err, result) {
      if (err) {
        return next(new Error(err.message));
      } else if (result.length == 0) {
        return next(new Error("Diesen Lehrer gibt es nicht..."));
      } else {
        // Wenn der Leher gefunden wurde:

        db.query(
          "INSERT INTO `selg_schema`.`kurs_db` (`name`, `lehrer_name`, `lehrer_id`, `type`, `jahrgang`, `leistungsebene`) VALUES (?, ?, ?, ?, ?, ?);",
          [
            genFachName(fach.toLowerCase()),
            result[0].username,
            result[0].id,
            fach.toLowerCase(),
            stufe,
            leistungsebene
          ],
          function(err, result) {
            if (err) {
              return next(new Error(err.message));
            } else {
              res.redirect("/");
            }
          }
        );
      }
    }
  );
});

router.post("/create_user", userHasAdminPermission(), function(req, res, next) {
  // Check Password Match
  if (req.body.password !== req.body.password_re)
    return next(new Error("Das Passwort muss übereinstimmen!"));

  // {"vorname":"awgawg","nachname":"awgawg","username":"awgawg","password":"awgawgawg","password_re":"awgawgag","leistungsebene":"admin"}

  if (!req.validationErrors()) {
    const username = req.body.username;
    const password = req.body.password;
    const vorname = req.body.vorname;
    const nachname = req.body.nachname;
    const permission = req.body.permission;

    // Checkt ob für einen Tutor eine wirkliche Klasse eingegeben wurde.
    // (Gehen würde z.B. "8a", "9b", "7c", Nicht funktionieren würde z.B. "88a, a9, 9 a, 9)a... usw.")
    if (!req.body.tutor_klasse.split('')[1].match(/[a-z]/i) || 
        !req.body.tutor_klasse.split('')[0].match(/[0-9]/i)){
      return next(new Error("Die Klasse ist ungültig."))
    }

    var db = require("../db.js");
    bcrypt.hash(password, saltRounds, function(err, hash) {
      db.query(
        "INSERT INTO `selg_schema`.`user_db` (`username`, `password`, `permission_flag`, `vorname`, `nachname`) VALUES (?, ?, ?, ?, ?)",
        [username, hash, permission, vorname, nachname],
        function(err, result, fields) {
          if (err) {
            return next(new Error(err.message));
          } else {
            db.query(
              "SELECT LAST_INSERT_ID() as user_id",
              (error, results, fields) => {
                if (error) {
                  return next(new Error(error.message));
                }else{
                  if(permission === "tutor"){
                    const lehrer_id = results[0].user_id;
                    let stufe;
                    let suffix;
                    try{
                      stufe = req.body.tutor_klasse.split('')[0];
                      suffix = req.body.tutor_klasse.split('')[1];
                    }catch(e){
                      return next(new Error("Die Klasse ist ungültig."))
                    }
                    db.query(
                    "INSERT INTO `selg_schema`.`klasse_db` (`lehrer_id`, `stufe`, `suffix`) VALUES (?, ?, ?);",
                    [lehrer_id, stufe, suffix],
                    function(err, result, fields) {
                      if (err) {
                        return next(new Error(err.message));
                      } else {
                        db.query(
                          "SELECT LAST_INSERT_ID() as user_id",
                          (error, results, fields) => {
                            if (error) {
                              return next(new Error(error.message));
                            }
                            res.redirect("/");
                            console.log(
                              [
                                datetime.create().format("m/d/Y H:M:S"),
                                ": [ NEW USER CREATED ] -> user_id=",
                                results[0].user_id
                              ].join("")
                            );
                          }
                        );
                      }
                    });
                  }else{
                    res.redirect("/");
                    console.log(
                      [
                        datetime.create().format("m/d/Y H:M:S"),
                        ": [ NEW USER CREATED ] -> user_id=",
                        results[0].user_id
                      ].join("")
                    );
                  }
                }
                
              }
            );
          }
        }
      );
    });
    
  } else {
    // @TODO - Invalider Benutzer bzw Fehler beim erstellen
    var handlebars_presettings = {
      layout: "admin",
      title: "SELG-Admintool",
      display_name: null,
      icon_cards: false,
      location: "Benutzer löschen",
      error: {
        message: "Beim erstellen des Nutzers ist ein Fehler aufgetreten..."
      }
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
  res.render("create/schueler", handlebars_presettings);
});

router.post("/create_schueler", userHasAdminPermission(), function(
  req,
  res,
  next
) {
  // { vorname: '', nachname: '', stufe: '', suffix: '' }
  const vorname = req.body.vorname;
  const nachname = req.body.nachname;
  const fullname = vorname + " " + nachname;
  const stufe = req.body.stufe;
  const suffix = req.body.suffix;

  var db = require("../db.js");

  db.query(
    "INSERT INTO `selg_schema`.`schueler_db` (`name`, `stufe`, `klassen_suffix`, `vorname`, `nachname`) VALUES (?, ?, ?, ?, ?)",
    [fullname, stufe, suffix, vorname, nachname],
    function(err, result, fields) {
      if (err) {
        return next(new Error(err.message));
      } else {
        db.query(
          "SELECT LAST_INSERT_ID() as schueler_id",
          (error, results, fields) => {
            if (error) {
              return next(new Error(error.message));
            } else {
              // @TODO Suche die Kurse in welchen er Standartmäßig ist
              console.log(`[NEW SCHÜLER] = ${results[0].schueler_id}`);
              res.redirect("/");
            }
          }
        );
      }
    }
  );
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

router.get("/announcement", userHasAdminPermission(), function(req,res,next){
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Admintool",
    icon_cards: false,
    location: "Neue Ankündigung"
  };


  res.render("announcement/new", handlebars_presettings);
});

router.post("/new_announcement", userHasAdminPermission(), function(req,res,next){

   const author_name = (res.locals.fullname[0]+" "+res.locals.fullname[1]);
   const author_id = res.locals.user_id;
   const datum =   datetime.create().format("Y-m-d H:M:S");
   const display_date = datetime.create().format("d.m.Y H:M:S");
   const message = req.body.message;
   const zielgruppe = req.body.zielgruppe;
 
   var db = require("../db.js");
 
   db.query(
     "INSERT INTO `selg_schema`.`announcement_db` (`author_name`, `author_id`, `datum`, `display_date`, `message`, `zielgruppe`) VALUES (?, ?, ?, ?, ?, ?);",
     [author_name, author_id, datum, display_date, message, zielgruppe],
     function(err, result, fields) {
       if (err) {
         return next(new Error(err.message));
       } else {
        console.log(`[NEW ANKÜNDIGUNG] from ${author_name}: ${message}`);
        res.redirect("/");
       }
     }
   );
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

module.exports = router;
