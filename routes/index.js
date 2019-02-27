var express = require("express");
var router = express.Router();
var session = require("express-session");

/* GET home page. */
router.get("/", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: req.params.name,
    icon_cards: true,
    location: "Übersicht"
  };
  if (res.locals.permission === "admin") {
    handlebars_presettings.user_count = 0;

    // @TODO ASYNC

    var db = require("../db.js");
    db.query("SELECT MAX(ID) AS LastID FROM user_db", function(err, result) {
      if (err) return next(new Error(err.message));
      handlebars_presettings.user_count = result[0].LastID;
      db.query("SELECT MAX(ID) AS LastID FROM schueler_db", function(err, result) {
        if (err) return next(new Error(err.message));
        handlebars_presettings.schueler_count = result[0].LastID;
        db.query("SELECT * FROM session_history", function(err, history_data) {
          if (err) return next(new Error(err.message));
          var history = {};
          for(var i = 0; i < history_data.length; i++){
            if(history[history_data[i].date] === undefined){
              history[history_data[i].date] = 1;
            } else {
              history[history_data[i].date] += 1;
            }
          }
          var Handlebars = require('handlebars');
          handlebars_presettings.session_history = new Handlebars.SafeString(JSON.stringify(history));
          handlebars_presettings.session_count = history_data[history_data.length -1].id;
          db.query('SELECT * FROM (SELECT * FROM user_db ORDER BY id DESC LIMIT 5) sub ORDER BY id ASC', function(err, last_users) {
            if (err) return next(new Error(err.message));
            var last_users_table = "";
            console.log(last_users);
            for(var i = 0; i < last_users.length; i++){
              last_users_table+= `<li class="list-group-item">${(last_users[i].permission_flag.charAt(0).toUpperCase() + last_users[i].permission_flag.slice(1))+": "+last_users[i].vorname+" "+last_users[i].nachname}</li>`;
            }
            handlebars_presettings.last_users = new Handlebars.SafeString(last_users_table);
            db.query('SELECT * FROM (SELECT * FROM kurs_db ORDER BY id DESC LIMIT 5) sub ORDER BY id ASC', function(err, last_courses) {
              if (err) return next(new Error(err.message));
              var last_courses_table = "";
              console.log(last_courses);
              for(var i = 0; i < last_courses.length; i++){
                last_courses_table+= `<li class="list-group-item">${last_courses[i].name+" Jhrg. "+last_courses[i].jahrgang}</li>`;
              }
              handlebars_presettings.last_courses = new Handlebars.SafeString(last_courses_table);
              res.render("index_admin", handlebars_presettings);
            });
          });
        });
      });
    });
  } else {
    res.render("index", handlebars_presettings);
  }
});

/* GET Profile page. */
router.get("/profil", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: res.locals.username,
    icon_cards: false,
    location: "Profil"
  };

  res.render("profile", handlebars_presettings);
});

/* GET Settings page. */
router.get("/einstellungen", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: res.locals.username,
    icon_cards: false,
    location: "Einstellungen"
  };

  res.render("einstellungen", handlebars_presettings);
});
// DEBUG

/* GET Datenschutz page. */
router.get("/datenschutz", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: res.locals.username,
    icon_cards: false,
    location: "Datenschutzrichtlinien"
  };

  res.render("policy/datenschutz", handlebars_presettings);
});

router.get("/generate_error", function(req, res, next) {
  res.render("generate_error");
});

router.post("/test", function(req, res, next) {
  console.log(JSON.stringify(req.body));
});

module.exports = router;
