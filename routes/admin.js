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

/* DEV: Admins können die Reports sehen*/
router.get("/reports", userHasAdminPermission(), function(req, res, next) {
  var handlebars_presettings = {
    layout: false,
    title: "SELG-Admintool",
    display_name: null,
    icon_cards: false,
    location: "DEV",
  };
  const db = require('../db')

  db.query("SELECT * FROM bugreports_db;", [], (err, result) => {
    if(err) next(err);

    handlebars_presettings.reports = result;
    res.render("dev/view_reports", handlebars_presettings);
  });
});

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// Form um einen Jahrgang hochzuladen
router.get("/create_all_schueler", userHasAdminPermission(), function(req, res, next) {
    res.render('create_jahrgang', {
    layout: "admin",
    title: "SELG-Admintool",
    icon_cards: false,
    location: "Jahrgang erstellen"
    });
});


// Post Request wenn die CSV Datei hochgeladen wurde
router.post("/jahrgang_erstellen", userHasAdminPermission(), function(req, res, next) {
  fs.readFile(req.files.jahrgang_csv.tempFilePath, 'latin1', (err, data) => {
    if(err) return next(new Error(err.message));
    var list = data.split(/\r?\n/);

    // Table Scope wird ermittelt
    const table_headings = list[0].split(';');
    let table_headings_shorts = [];

    // Headings die wichtig sind um die Daten zu kontrollieren
    var table_headings_cut = [];
    let j = 0;
    table_headings.forEach(heading => { 
      if(heading.indexOf('(Kürzel)') == -1 && heading.indexOf('Lehrkraft') == -1){
        if(heading.indexOf('Fachbezeichnung')){
          table_headings_cut.push(heading.split(' ')[0]);
        }else{
          table_headings_cut.push(heading);
        }
      }else{
        table_headings_shorts.push(j);
      }
      j++;
    })

    list.splice(0,1);
    list.splice(list.length-1,list.length);    

    // Die länge des ersten (richtigen) eintrags entscheidet wie groß/klein die spacings sind
    let length_tmp = (list[0].length);

    // Alle leeren Zeilen werden gelöscht
    for(var i = list.length-1; i > 0; i--){
      if(list[i].length <= length_tmp/2){
        list.remove(i);
      }
    }

    // Zeile -> Objekt (Schüler)
    let schueler_objects = list.map(string => {
      let tmp_obj = {};
      let i = 0;
      table_headings.forEach(prop => {
        tmp_obj[prop] = string.split(';')[i];
        i++;
      });
      return(tmp_obj);
    });

    // Anzahl Klassen werden ermittelt
    let klassen = {};
    schueler_objects.forEach(schueler => {
      if(!klassen[schueler['Klasse']])
        klassen[schueler['Klasse']] = 1;
    })

    // Eine Propmt für die Klassen wird erstellt
    var klassen_promt = [];
    for(var klasse in klassen) {
      klassen_promt.push(klasse);
    }

    // s_id dient der Indexierung der Schüler
    let s_id = 0;
    var schueler = list.map(string => {
      s_id++;
      let values = string.split(';');
      // Lehrer Kürzel werden entfernt
      let offset = 0;
      table_headings_shorts.forEach(element => {
        values.remove(element-offset);
        offset++;
      })

      return values;
    });

    // Alle möglichen User als Klassenlehrer werden gesucht:
    // Wobei Username => Kürzel
    var lehrer = [];
    const db = require('../db');
    db.query(
      "SELECT username, vorname, nachname, id FROM selg_schema.user_db WHERE NOT ( permission_flag = 'admin');", [], (err, data) => {
        if(err) console.log(err.message);
        data.forEach(obj => { 
          lehrer.push(`${obj.username} - ${obj.vorname} ${obj.nachname} (${obj.id})`)
        });
        res.render('create_jahrgang_approof', {
          layout: "admin",
          title: "SELG-Admintool",
          icon_cards: false,
          location: "Jahrgang erstellen",
          schueler: schueler,
          schueler_string: JSON.stringify(schueler_objects),
          count: schueler.length,
          table_headings: table_headings_cut,
          klassen: klassen_promt,
          user: lehrer
          });
    });
  });
});

// Daten der CSV Datei werden endgültig hochgeladen
router.post("/jahrgang_erstellen_sql", userHasAdminPermission(), function(req, res, next) {
  var schueler = JSON.parse(req.body.schueler);
  const db = require("../db");

  /* Es werden folgende Einträge erstellt:
  **  > Schüler (Name, Vorname, Stufe, Suffix)
  **  > Klassen (Lehrer_ID, Stufe, Suffix) -> Es muss der Klassenlehrer und seine ID ermittelt werden
  **  > Kurse (Name, Fachlehrer_Name,  Fachlehrer_ID, Type, Jahrgang, Leistungsebene)
  **
  ** Es muss also erst folgendes ermittelt werden =>
  **    >> Klassenlehrer der Klasse -> Via Prompt
  ** 
  ** Dann müssen die Fachlehrer andhand der Kürzel ermittelt werden:
  **    >> Kürzel => (Fachlehrer_Name, Fachlehrer_ID)
  **      und
  **    >> Fachbezeichnungskürzel => (Name (Fachname), Type (SELG-Schreibweise))
  */    

  var klassen = {};

  // > Schüler (Name, Vorname, Stufe, Suffix)
  let new_schueler = 0;
  schueler.forEach(Schueler => {
    if(!klassen[Schueler.Klasse]){ klassen[Schueler.Klasse] = 1 };
    db.query("INSERT INTO schueler_db (`name`, `stufe`, `klassen_suffix`, `vorname`, `nachname`) VALUES (?, ?, ?, ?, ?);", 
    [(Schueler.Vornamen +" "+ Schueler.Familienname), Schueler.Klasse.split('')[1],  Schueler.Klasse.split('')[2], Schueler.Vornamen, Schueler.Familienname], (err, data) => {
      if(err) return next(new Error(err.message));
      new_schueler++;
      Schueler.id = data.insertId;
    });
  })

  // > Klassen (Lehrer_ID, Stufe, Suffix)
  let new_klassen = 0;
  let Klassen = [];
  for(var Klasse in klassen){

    const suffix = Klasse.split('')[2];
    const stufe = Klasse.split('')[1];

    db.query("SELECT id, nachname, username FROM user_db WHERE username = ? OR username = ?", [req.body[`klasse_${Klasse}_a`].split(' - ')[0],req.body[`klasse_${Klasse}_b`].split(' - ')[0]], (err, data) =>{
      if(err) return next(new Error(err.message));
      if(data.length <= 1) {
        return next(new Error(`Einer der beiden Tutoren (${req.body[`klasse_${Klasse}_a`].split(' - ')[0] +", "+ req.body[`klasse_${Klasse}_b`].split(' - ')[0]}) konnte nicht gefunden werden`));
      }else{
        db.query("INSERT INTO klasse_db (`lehrer_id`, `stufe`, `suffix`, `lehrer_id_secondary`) VALUES (?, ?, ?, ?);", [data[0].id, stufe, suffix, data[1].id], (err, res) =>{
          if(err) return next(new Error(err.message));
          Klassen.push({
            id: data[0].id, 
            stufe: stufe, 
            suffix: suffix,
            lehrer: data[0].nachname,
            lehrer_s: data[0].username,
            lehrer_sec: data[1].nachname,
            lehrer_s_sec: data[1].username
          });
          new_klassen++;

          // Fachlehrer werden zum Tutor ernannt
          db.query("UPDATE user_db SET `permission_flag` = 'tutor' WHERE (id = ? OR id = ?);", [data[0].id, data[1].id], (err, res) => {
            if(err) return next(new Error(err.message));
            console.log(res);
          });
        });
      }
    });
  }

  // > Kurse (Name, Fachlehrer_Name,  Fachlehrer_ID, Type, Jahrgang, Leistungsebene)

  var kurse_tmp = {};
  var kurse = [];
  // Macht aus Objekten eine Array mit allen Values
  // Aus diesen werden dann die Kurse und deren Lehrer ermittelt
  schueler.map(obj => {
    let tmp = [];
    for(var key in obj){
      tmp.push(obj[key])
    }
    return tmp;
  })
  .forEach(value_list => {
    for(let i = 3 /* Name und Klasse wird übersprungen*/; i < value_list.length - 1; i+=2){
      // Kursname: Typ_LehrerKürzel_jahrgang Bsp: "BK_POR_08d"
      if(!kurse_tmp[`${value_list[i]}#${value_list[i+1]}#${value_list[0]}`]){
        kurse_tmp[`${value_list[i]}#${value_list[i+1]}#${value_list[0]}`] = 1
      }
    }
  });
  var new_kurse = 0;
  for(var key in kurse_tmp){
    new_kurse++;
    var fl_username, type, jahrgang, leistungsebene, type_raw;
    fl_username = key.split('#')[1];
    jahrgang = key.split('#')[2];
    leistungsebene = key.split('#')[0].split('_')[1] ? key.split('#')[0].split('_')[1].indexOf('/') == -1 ? key.split('#')[0].split('_')[1].toLowerCase() : 'g' : 'g';
    type_raw = key.split('#')[0].split('_')[0];
    type = genTypeName(type_raw);

    kurse.push({
      raw_name: key.replace(/#/g,'_'),
      fl_name: "", 
      fl_id: "", 
      fl_username: fl_username,
      name: genFachName(type), 
      type: type, 
      type_raw: type_raw,
      jahrgang: jahrgang , 
      leistungsebene: leistungsebene
    });
  }
  let kurse_final = [];
  let kurse_final_error = [];
  kurse.forEach(Kurs => {
    // Fachlehrer wird gesucht
    db.query("SELECT * FROM user_db WHERE username IN (?)", [Kurs.fl_username.toUpperCase()], (err, data) =>{
      if(err) return next(new Error(err.message));
      if(data.length == 0) {
        kurse_final_error.push({
          raw_name: Kurs.raw_name,
          err: true,
          fl_name: "Unbekannt", 
          fl_id: 'Unbekannt', 
          fl_username: Kurs.fl_username,
          name: Kurs.name,
          type: Kurs.type, 
          type_raw: Kurs.type_raw,
          jahrgang: Kurs.jahrgang , 
          leistungsebene: Kurs.leistungsebene
        });
      }else{
        kurse_final.push({
          raw_name: Kurs.raw_name,
          fl_name: data[0].nachname, 
          fl_id: data[0].id, 
          err: false,
          fl_username: Kurs.fl_username,
          name: Kurs.name,
          type: Kurs.type, 
          type_raw: Kurs.type_raw,
          jahrgang: Kurs.jahrgang , 
          leistungsebene: Kurs.leistungsebene
        });
        db.query("INSERT INTO kurs_db (`name`, `lehrer_name`, `lehrer_id`, `type`, `jahrgang`, `leistungsebene`) VALUES (?, ?, ?, ?, ?, ?);",
          [Kurs.name, data[0].nachname, data[0].id, Kurs.type, jahrgang.split('')[1], leistungsebene], (err, data) => {
            if(err) return next(new Error(`Es ist ein fehler aufgetreten...`));
            const kurs_id = data.insertId;

            //console.log(`${schueler[0]['G5 Fachbezeichnung']}_${schueler[0]['G5 Fachlehrer (Kürzel)']}_${schueler[0]['Klasse']}`);
            

            // Schueler werden mit den Kursen gelinkt
            schueler.forEach(Schueler => {
              let prop_list = [];
              for(var property in Schueler){
                if(property != 'Klasse' && property != 'Familienname' && property != 'Vornamen'){
                  prop_list.push(Schueler[property]);
                }
              };
              for(let i = 0; i < prop_list.length - 1; i+=2){
                //console.log(Schueler.id+": "+prop_list[i]+"_"+prop_list[i+1]+"_"+Schueler.Klasse);
                if(Kurs.raw_name === `${prop_list[i]}_${prop_list[i+1]}_${Schueler.Klasse}`){
                  //console.log(Schueler.id + " IN " + Kurs.raw_name);
                  db.query("INSERT INTO schueler_kurs_link (`id_schueler`, `id_kurs`) VALUES (?, ?);", [Schueler.id, kurs_id], (err, data) => {
                    if(err) return next(new Error(`Es ist ein fehler aufgetreten...`));
                  })
                }

              }
            });

        })
      }
    })
  });
  
  // Wartet bis alle requests getätigt wurden
  setTimeout(function(){

    kurse_final.forEach(Kurs => {
      if(!Kurs.name){
        return next(new Error(`Der Kurs ${Kurs.type_raw} entspricht nicht der SELG-Tool Namensgebung.`))
      }
    });

    res.render('jahrgang_final', { 
    layout: "admin",
    title: "SELG-Admintool",
    location: "Jahrgang erstellen",
    kurse: [...kurse_final, ...kurse_final_error].sort(dynamicSort("type")),
    schueler: schueler,
    klassen: Klassen,
    new_kurse: kurse_final.length+" von "+new_kurse,
    new_klassen: new_klassen,
    new_schueler: new_schueler
  })}, 6000)
});

function dynamicSort(property) {
  var sortOrder = 1;

  if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }

  return function (a,b) {
      if(sortOrder == -1){
          return b[property].localeCompare(a[property]);
      }else{
          return a[property].localeCompare(b[property]);
      }        
  }
}

function genTypeName(type_raw) {
  type_raw = type_raw.toLowerCase();
  let ret;
  switch (type_raw) {
    case "d":
      ret = "deutsch";
      break;
    case "e":
      ret = "englisch";
      break;
    case "m":
      ret = "mathematik";
      break;
    case "gl":
      ret = "gesellschaftslehre";
      break;
    case "mu":
      ret = "musik";
      break;
    case "bk":
      ret = "bildende_kunst";
      break;
    case "ch":
      ret = "chemie";
      break;
    case "bio":
      ret = "biologie";
      break;
    case "ph":
      ret = "physik";
      break;

    // TODO
    case "relrk":
      ret = "religion";
      break;
    case "relev":
      ret = "religion";
      break;
    case "eth":
      ret = "religion";
      break;
    case "spkos":
      ret = "sport";
      break;
    case "nawi":
      ret = "naturwissenschaften";
      break;
    case "sgl":
      ret = "sgl";
      break;
    case "wkm":
      ret = "kommunikation_und_medien";
      break;
    case "wök":
      ret = "oekologie";
      break;
    case "wds":
      ret = "darstellendes_spielen";
      break;
    case "wsp":
      ret = "sport_und_gesundheit";
      break;
    case "wfr":
      ret = "franzoesisch";
      break;
    case "wtw":
      ret = "technik_und_wirtschaft";
      break;
    case "wbk": //TODO Abkürzugen klären
      ret = "kunst_und_design";
      break;
    case "wal": //TODO Abkürzugen klären
      ret = "technik_und_wirtschaft";
      break;
    default:
      ret = "unknown ("+type_raw+")";
      break;
  }
  return ret;
}


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
      ret = "Kunst&Design";
      break;
  }
  return ret;
}

router.get("/delete_all_schueler", userHasAdminPermission(), function(req, res, next) {

  const db = require('../db');
  db.query("SELECT stufe FROM klasse_db;", [], (err, klassen) => {
    if (err) return next(new Error(err.message));
    var jahrgang = {};
    var jahrgaenge = [];
    klassen.forEach(Klasse => { if(!jahrgang[Klasse.stufe]) jahrgang[Klasse.stufe] = 1})
    for(var Stufe in jahrgang){ jahrgaenge.push(Stufe) };
    var handlebars_presettings = {
      layout: "admin",
      title: "SELG-Admintool",
      location: "Jahrgang löschen",
      jahrgang: jahrgaenge
    };
    res.render("delete_all", handlebars_presettings);
  });
});

router.post("/delete_jahrgang", userHasAdminPermission(), function(req, res, next) {
  const jahrgang = req.body.jahrgang;

  const db = require('../db');
  db.query("SELECT id FROM schueler_db WHERE stufe = ?;", [jahrgang], (err, data) => {
    if (err) return next(new Error(err.message));
    const schueler = data.length;
    const schueler_ids = data.map(obj => obj.id);
    
    db.query("SELECT id FROM bewertungen_db WHERE schueler_id IN (?);", [schueler_ids], (err, data) => {
      if (err) return next(new Error(err.message));
      const bewertungen = data.length;
      const bewertungen_ids = data.map(obj => obj.id);

      db.query("SELECT id FROM kurs_db WHERE jahrgang = ?;", [jahrgang], (err, data) => {
        if (err) return next(new Error(err.message));
        const kurse = data.length;
        db.query("SELECT lehrer_id FROM klasse_db WHERE stufe = ?", [jahrgang], (err, data) => {
          if (err ) return next(new Error(err.message));
          const klassen = data.length;
          const lehrer_ids = data.map(obj => obj.lehrer_id);

          
          /* Zu löschen:
          ** >> bewertungen_db
          ** >> bewertungen_sumup_db
          ** >> klasse_db
          ** >> kurs_db
          ** >> schueler_db
          ** >> schueler_kurs_link  
          ** >> user_db update permissions
          **
          */

          // Bewertungen werden gelöscht
          db.query("DELETE FROM bewertungen_db WHERE schueler_id IN (?);", [schueler_ids], (err, data) => {           
            if (err) return next(new Error(err.message));
            // Bewertungen_sumup werden gelöscht
            db.query("DELETE FROM bewertungen_sumup_db WHERE schueler_id IN (?);", [schueler_ids], (err, data) => {
              if (err) return next(new Error(err.message));
              // Klassen werden gelöscht
              db.query("DELETE FROM klasse_db WHERE stufe = ?;", [jahrgang], (err, data) => {
                if (err) return next(new Error(err.message));
                // Kurse werden gelöscht
                db.query("DELETE FROM kurs_db WHERE jahrgang = ?;", [jahrgang], (err, data) => {
                  if (err) return next(new Error(err.message));
                  // Schüler werden gelöscht
                  db.query("DELETE FROM schueler_db WHERE stufe = ?;", [jahrgang], (err, data) => {
                    if (err) return next(new Error(err.message));
                    // Schüler-Kurs-Links werden gelöscht
                    db.query("DELETE FROM schueler_kurs_link WHERE id_schueler IN (?);", [schueler_ids], (err, data) => {
                      if (err) return next(new Error(err.message));
                      // Tutoren werden zu Fachlehrern
                      db.query("UPDATE user_db SET permission_flag = 'fachlehrer' WHERE id IN (?);", [lehrer_ids], (err, data) => {
                        if (err) return next(new Error(err.message));
                        res.redirect('/');

                        console.log(
                          `Es wurde ein Jahrgang gelöscht:\r\n`+
                          `\tSchüler: ${schueler}\r\n`+
                          `\tKlassen: ${klassen}\r\n`+
                          `\tKurse: ${kurse}\r\n`+
                          `\tBewertungen: ${bewertungen}\r\n`
                        )
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

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
              res.redirect("/admin/create_kurs");
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
    const username = req.body.username.toUpperCase();
    const password = req.body.password;
    const vorname = req.body.vorname;
    const nachname = req.body.nachname;
    const permission = req.body.permission;

    
    // Checkt ob für einen Tutor eine wirkliche Klasse eingegeben wurde.
    // (Gehen würde z.B. "8a", "9b", "7c", Nicht funktionieren würde z.B. "88a, a9, 9 a, 9)a... usw.")
    if(req.body.permission === 'tutor'){
      if (!req.body.tutor_klasse.split('')[1].match(/[a-z]/i) || 
          !req.body.tutor_klasse.split('')[0].match(/[0-9]/i)){
        return next(new Error("Die Klasse ist ungültig."))
      }
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
                            res.redirect("/admin/create_user");
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
                    res.redirect("/admin/create_user");
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



router.post("/delete_user", userHasAdminPermission(), function(req, res, next) {
  const username = req.body.username;
  const db = require('../db');
  db.query("DELETE FROM user_db WHERE username = ?;", [username, nachname], (err, data) => {
    if(err) return next(new Error(err.message));
    console.log(data);
    res.redirect('/');
  })
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

router.get("/liste_kurse", userHasAdminPermission(), function(req,res,next){
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Admintool",
    icon_cards: false,
    location: "Liste (Kurse)"
  };

  const db = require('../db');
  db.query("SELECT * FROM kurs_db;", (err, result) => {
    if(err) return next(new Error(err.message));
    handlebars_presettings.kurse = result;
    res.render("listen/kurse", handlebars_presettings);
  });
});

router.get("/liste_schueler", userHasAdminPermission(), function(req,res,next){
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Admintool",
    location: "Liste (Schüler)"
  };
  const db = require('../db');
  db.query("SELECT * FROM schueler_db;", (err, result) => {
    if(err) return next(new Error(err.message));
    handlebars_presettings.schueler = result;
    res.render("listen/schueler", handlebars_presettings);
  });
});

router.get("/liste_benutzer", userHasAdminPermission(), function(req,res,next){
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Admintool",
    icon_cards: false,
    location: "Liste (Benutzer)"
  };

  const db = require('../db');
  db.query("SELECT * FROM user_db;", (err, result) => {
    if(err) return next(new Error(err.message));
    handlebars_presettings.user = result;
    res.render("listen/benutzer", handlebars_presettings);
  });
});


passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

module.exports = router;
