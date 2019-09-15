var express = require('express');
var router = express.Router();

function toName(string){
  return string.replace('_', ' ');
}

// Zeigt das Profil eines Nutzers 
// Bsp. /user?name=max_mustermann
router.get('/', function(req, res, next) {
  if(req.query.name === undefined){
    return next(new Error(""));
  }else{  
    const raw_name = req.query.name;
    const db = require('../db');

    db.query('SELECT * FROM schueler_db WHERE name = ?',[toName(raw_name)], (err, result) => {
      if(err) return next(new Error(err.message));
      if(result.length === 0) return next(new Error(`Wir konnten niemanden mit dem Namen "${toName(raw_name)}" finden.`));
      const student = result[0];

      var handlebars_presettings = {
        layout: res.locals.permission,
        title: `Benutzer`,
        name: `${toName(raw_name)}`,
        location: `Benutzer / ${toName(raw_name)}`,
        stufe: student.stufe,
        klasse: student.klassen_suffix,
        index: student.index
      };

      var student_is_accessible = ((student.stufe == res.locals.stufe) && (student.klassen_suffix == res.locals.stufe_suffix)) ? true : false;

      // Es werden alle Schüler gesucht, die der Benutzer sehen darf.
      db.query('SELECT id_schueler AS id FROM schueler_kurs_link WHERE id_kurs IN( SELECT id from kurs_db WHERE lehrer_id = ? )',[res.locals.user_id], (err, result) => {
        if(err) return next(new Error(err.message));
        
        // Wenn der Schüler von der URL (Bsp. user?name=max_mustermann) gefunden wird, wird die Seite gerendert.
        // Wenn dies nicht der Fall ist, versucht der Benutzer einen Schüler zu sehen, den er in keinem Kurs hat.

        // Checkt ob der Fachlehrer diesen Schüler sehen darf
        result.forEach(result => { 
            if(result.id === student.id) student_is_accessible = true;
          });

        console.log(student_is_accessible);

        // Klassenlehrer wird gesucht
        db.query('SELECT * FROM user_db WHERE id = (SELECT lehrer_id FROM klasse_db WHERE stufe = ? AND suffix = ?)', [handlebars_presettings.stufe, handlebars_presettings.klasse], (err, result) => {
          if(student_is_accessible) {
            if(err || result.length === 0){
              handlebars_presettings.klassenlehrer = "n/a"
              res.render("user", handlebars_presettings)
            }else{
              handlebars_presettings.klassenlehrer = result[0].vorname + " " + result[0].nachname;
              res.render("user", handlebars_presettings)
            }
          }else{
            return next(new Error(`Wir konnten niemanden mit dem Namen "${toName(raw_name)}" finden.`));
          }
        });
      });

    });
  }
});

module.exports = router;
