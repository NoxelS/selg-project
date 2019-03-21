var express = require('express');
var router = express.Router();

// Macht aus dem parameter einen richtigen Namen
// BSP 'max_mustermann' -> 'Max Mustermann'
function toName(string){
  return string.split("_")[0].split('')[0].toUpperCase()+string.split("_")[0].substring(1)
        +" "+string.split("_")[1].split('')[0].toUpperCase()+string.split("_")[1].substring(1)
}

// Zeigt das Profil eines Nutzers 
// Bsp. /user?name=max_mustermann
router.get('/', function(req, res, next) {
  if(req.query.name === undefined){
    res.redirect('/');
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

      // Es werden alle Schüler gesucht, die der Benutzer sehen darf.
      db.query('SELECT id_schueler AS id FROM schueler_kurs_link WHERE id_kurs IN( SELECT id from kurs_db WHERE lehrer_id = ? )',[res.locals.user_id], (err, result) => {
        if(err) return next(new Error(err.message));
        
        // Wenn der Schüler von der URL (Bsp. user?name=max_mustermann) gefunden wird, wird die Seite gerendert.
        // Wenn dies nicht der Fall ist, versucht der Benutzer einen Schüler zu sehen, den er in keinem Kurs hat.

        var student_is_accessible = false;
        result.forEach(result => { if(result.id === student.id) student_is_accessible = true});
        if(student_is_accessible) {
          res.render("user", handlebars_presettings)
        }else{
          return next(new Error(`Wir konnten niemanden mit dem Namen "${toName(raw_name)}" finden.`));
        }
      });

    });
  }
});

module.exports = router;
