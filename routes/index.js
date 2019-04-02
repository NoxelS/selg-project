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
    location: ""
  };
  if (res.locals.permission === "admin") {
    handlebars_presettings.user_count = 0;

    // @TODO ASYNC bewertungen_count

    var db = require("../db.js");
    db.query("SELECT MAX(ID) AS LastID FROM user_db", function(err, result) {
      if (err) return next(new Error(err.message));
      handlebars_presettings.user_count = result[0].LastID;
      db.query("SELECT MAX(ID) AS LastID FROM schueler_db", function(err, result) {
        if (err) return next(new Error(err.message));
        handlebars_presettings.schueler_count = result[0].LastID;
        db.query("SELECT MAX(ID) AS LastID FROM bewertungen_db", function(err, result) {
          if (err) return next(new Error(err.message));
          handlebars_presettings.bewertungen_count = result[0].LastID;
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
              for(var i = 0; i < last_users.length; i++){
                last_users_table+= `<li class="list-group-item">${(last_users[i].permission_flag.charAt(0).toUpperCase() + last_users[i].permission_flag.slice(1))+": "+last_users[i].vorname+" "+last_users[i].nachname}</li>`;
              }
              handlebars_presettings.last_users = new Handlebars.SafeString(last_users_table);
              db.query('SELECT * FROM (SELECT * FROM kurs_db ORDER BY id DESC LIMIT 5) sub ORDER BY id ASC', function(err, last_courses) {
                if (err) return next(new Error(err.message));
                var last_courses_table = "";
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
    });
  } else if(res.locals.permission === "fachlehrer" /* @TODO */ || res.locals.permission === "tutor"){
    var db = require('../db.js')
    var Handlebars = require('handlebars');
    db.query('SELECT * FROM (SELECT * FROM bewertungen_db WHERE lehrer_id = (?) ORDER BY id DESC LIMIT 10) sub ORDER BY id DESC', [res.locals.user_id], function(err, last_bewertungen) {
      if (err){ 
        return next(new Error(err.message)) 
      }else if(last_bewertungen.length === 0){
        handlebars_presettings.least_bewertung = "n/a";
        res.render("index_fachlehrer", handlebars_presettings);
      }else{
      var table = "";
      for(var i = 0; i < last_bewertungen.length; i++){
        var row = "<tr>";
        row += `<td> ${last_bewertungen[i].kurs_name}</td>`;
        row += `<td> ${last_bewertungen[i].leistungsebene}</td>`;

        // Um den Namen wird ein Anchor gemacht, damit man auf den Namen klicken kann,
        // um zusätzliche Informationen über einen Schüler sehen zu können.
        // Der Style vom Anchor wird dabei zurückgesetzt
          row += `<td><a style="color: inherit;
          text-decoration: inherit;" href="/user?name=${last_bewertungen[i].schueler_name.split(" ")[0]+"_"+last_bewertungen[i].schueler_name.split(" ")[1]}">${last_bewertungen[i].schueler_name}<a></td>`;
        
        row += `<td> ${last_bewertungen[i].date}</td>`;
        row += `<td><a href="/bewertung/view=${last_bewertungen[i].id}"><i class="fas fa-search"></i></a></td>`;
        row += `<td><a href="/bewertung/download=${last_bewertungen[i].id}"><i class="fas fa-download"></i></a></td>`;
        table += row + "</tr>";
      }
      handlebars_presettings.last_bewertungen = new Handlebars.SafeString(table);
      handlebars_presettings.least_bewertung = last_bewertungen[0].date;
      res.render("index_fachlehrer", handlebars_presettings);
      }
    });
  }else if(res.locals.permission === "tutor") {
    res.render("index/tutor", handlebars_presettings);
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

/*
  Wenn die SUchleiste benutzt wird, wird die Suchanfrage an /search=[Name der gesucht wurde] weitergeleitet.
*/
router.post("/search", function(req, res, next) {
  if(req.body.nametofind.length === 0){
    res.redirect('/search= ');
  }else{
    res.redirect("/search="+req.body.nametofind);    
  }
});

router.post("/tutorial/cancel", function(req, res, next){
  const db = require("../db")
  db.query("UPDATE `selg_schema`.`user_db` SET `hasDoneTutorial` = '1' WHERE (`id` = ?);", [res.locals.user_id], (result, err) =>{
    if(err) console.log(err);
    res.redirect("/")
  })
});

router.get("/search=:nametofind", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: res.locals.username,
    icon_cards: false,
    location: "Schüler Finden..."
  };
  /* 
    Wenn ein admin die Suchleiste benutzt, werden Ihm alle Schüler angezeigt, die es in der Datenbank gibt.
    handlebars_presettings.result ist dabei eine Array mit allen Schülern als Objekt
  */
  if(res.locals.permission === 'admin'){
    var db = require("../db.js");
    db.query("SELECT  * FROM  schueler_db WHERE  name LIKE ? ORDER BY name ASC",["%"+req.params.nametofind+"%"], function(err, result) {
      // Wenn es ein Error gibt, oder niemand gefunden wird (result.length = 0), wird ein Error weitergegeben
      if (err) return next(new Error(err.message));
      handlebars_presettings.nametofind = req.params.nametofind;
      if(result.length === 0){
        next(new Error("Wir konnten leider niemanden mit dem Namen "+req.params.nametofind+" finden."));
      }else{
        // Durch eine helperfunction wird aus handlebars_presettings.result eine HTML-Tabelle (HBS Safestring) erstellt
        handlebars_presettings.result = result;
        handlebars_presettings.resultLength = result.length;

        // Zeigt den Table-Footer nur an wenn mehr als 10 Ergebnisse gefunden wurden.
        handlebars_presettings.footer_is_needed = handlebars_presettings.result.length >= 10 ? true : false;

        res.render("search/search", handlebars_presettings);
      }
    });
  }else{
    /* 
      Wenn ein Fachlehrer die Suchleiste benutzt, werden Ihm alle Schüler angezeigt, die in seinen Kursen vorahnden sind
      Zuerst werden alle Schüler gesucht, dann werden alle schüler ids gescuht, welche in seinen Kursen vorhanden sind
      Die Überschneidungen dieser zwei Mengen werden in der handlebars_presettings.result Array gespeichert.
    */
    var db = require("../db.js");
    db.query("SELECT * FROM schueler_db WHERE  name LIKE ? ORDER BY name ASC",["%"+req.params.nametofind+"%"], function(err, result) {
      if (err) return next(new Error(err.message));
      handlebars_presettings.nametofind = req.params.nametofind;
      handlebars_presettings.schueler_gefunden = result;
      handlebars_presettings.result = [];


      if(result.length === 0){
        next(new Error("Wir konnten leider niemanden mit dem Namen "+req.params.nametofind+" finden."));
      }else{
        // Zeigt nur schüler an, welche im Kurs eines Lehrers sind
        db.query("SELECT id_schueler FROM schueler_kurs_link WHERE id_kurs IN (SELECT id FROM kurs_db WHERE lehrer_id = ?)",[res.locals.user_id], function(err, result) {
          if (err || result.length === 0) return next(new Error("Wir konnten leider niemanden mit dem Namen "+req.params.nametofind+" finden."));
          for(var i = 0; i < handlebars_presettings.schueler_gefunden.length ; i++){
            for(var k = 0; k < result.length; k++){
              if(handlebars_presettings.schueler_gefunden[i].id === result[k].id_schueler){
                handlebars_presettings.result.push(handlebars_presettings.schueler_gefunden[i]);
              }
            }
          }
          if(handlebars_presettings.result.length === 0 || result.length === 0){
            return next(new Error("Wir konnten leider niemanden mit dem Namen "+req.params.nametofind+" finden.")); 
          }else{

           
            handlebars_presettings.resultLength = handlebars_presettings.result.length;
            handlebars_presettings.result = handlebars_presettings.result.sort( (a,b) => {return a.id - b.id});
            
            // Das folgende Script schaut, dass kein Schüler zweimal angezeigt wird.
            let tmp_schueler= {};
            let tmp_schuelerliste = [];
            let schueler_kuse = {};
            handlebars_presettings.result.forEach(Schueler => {
              if(tmp_schueler[Schueler.id] === undefined){
                tmp_schueler[Schueler.id] = 1;
                tmp_schuelerliste.push(Schueler);
              }
            });
            handlebars_presettings.result = tmp_schuelerliste;

           
            //console.log(handlebars_presettings.result.map(obj => obj.id).join(", "));

            // Sucht die Kurse in denen die Schüler sind
            db.query("SELECT * FROM schueler_kurs_link WHERE id_schueler IN (?)",[ handlebars_presettings.result.map(obj => obj.id)], function(err, result) {
              if (err || result.length === 0) return next(new Error("Wir konnten leider niemanden mit dem Namen "+req.params.nametofind+" finden."));
              let tmp_kurslsite = {};
              let schueler_informationen = [];


              result.forEach(Kurs_Link => {
                // Es wird geschaut, ob der Schüler in einem Kurs des Lehrers ist.
                if((res.locals.meineKurse.findIndex(x => x.id === Kurs_Link.id_kurs)) !== -1){
                  if(tmp_kurslsite[Kurs_Link.id_schueler] === undefined){
                    tmp_kurslsite[Kurs_Link.id_schueler] = 1;
                    schueler_informationen.push({
                      schueler_id: Kurs_Link.id_schueler,
                      kurs_id: [{id: Kurs_Link.id_kurs, name: res.locals.meineKurse[res.locals.meineKurse.findIndex(x => x.id === Kurs_Link.id_kurs)].name +" "+ res.locals.meineKurse[res.locals.meineKurse.findIndex(x => x.id === Kurs_Link.id_kurs)].jahrgang}]
                    })
                  }else if(tmp_kurslsite[Kurs_Link.id_schueler] !== undefined){
                    schueler_informationen[(schueler_informationen.findIndex(x => x.schueler_id === Kurs_Link.id_schueler))]['kurs_id'].push({id: Kurs_Link.id_kurs, name: res.locals.meineKurse[res.locals.meineKurse.findIndex(x => x.id === Kurs_Link.id_kurs)].name +" "+ res.locals.meineKurse[res.locals.meineKurse.findIndex(x => x.id === Kurs_Link.id_kurs)].jahrgang});
                  }
                }
              });


              // Jeder Schüler in der Liste erhält ein Attribut "kurse_belegt" welches eine Array von objekten hat. Dise haben ein Attribut id und ein Attribut name
              // Also z.B. schueler['kurse_belegt'] = [{id: 36, name: "Mathematik"}, {id: 37, name: "Deutsch"}]

              schueler_informationen.forEach(info => {
                //console.log(handlebars_presettings.result[handlebars_presettings.result.findIndex(x => x.id === info.schueler_id)]);
                handlebars_presettings.result[handlebars_presettings.result.findIndex(x => x.id === info.schueler_id)]['kurse_belegt'] = info.kurs_id;
                //console.log(handlebars_presettings.result[handlebars_presettings.result.findIndex(x => x.id === info.schueler_id)]);
              });
       
              handlebars_presettings.schueler_informationen = schueler_informationen;
              // Zeigt den Table-Footer nur an wenn mehr als 10 Ergebnisse gefunden wurden.
              handlebars_presettings.footer_is_needed = handlebars_presettings.result.length >= 10 ? true : false;
             
              res.render("search/search", handlebars_presettings);

            });
          } 
        });
      }
    });
  }
});

router.get("/klasse", function(req, res, next) {
  if(res.locals.permission !== "tutor") return next(new Error(""));

  var handlebars_presettings = {
    layout: res.locals.permission,
    location: "Meine Klasse"
  };

  const db = require("../db")

  db.query(
    "SELECT * FROM selg_schema.schueler_db WHERE stufe = ? AND klassen_suffix = ?;", [res.locals.stufe, res.locals.stufe_suffix],
    (error, result) => {
     if(error) return next(new Error(error.message));
     res.locals.meineKlasse = result;
     res.render("meine_klasse", handlebars_presettings);
  });
});


module.exports = router;
