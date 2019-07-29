var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("express-handlebars");
var datetime = require("node-datetime");
var fs = require("fs");
var nodeStatusCodes = require("node-status-codes");
const favicon = require("express-favicon");
var expressValidator = require("express-validator");
var expressFileupload = require("express-fileupload");

// Load Envs
require('dotenv').config();

// Authentication Packages
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var MySQLStore = require("express-mysql-session")(session);
var bcrypt = require("bcrypt");

// MySQL Session Storage
var sessionStore = new MySQLStore({
  host:   process.env.MYSQL_HOST_IP,
  port:   process.env.MYSQL_HOST_PORT,
  user:   process.env.MYSQL_HOST_USER,
  password:   process.env.MYSQL_HOST_PASSWORD,
  database:   process.env.MYSQL_HOST_DATABASE,
  insecureAuth :   process.env.MYSQL_HOST_INSECUREAUTH,
});

// Logging
var staticLogger = require("./log/statistic-logger");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/user");
var loginRouter = require("./routes/login");
var errorRouter = require("./routes/error");
var adminRouter = require("./routes/admin");
var logoutRouter = require("./routes/logout");
var bewertungRouter = require("./routes/bewertung");
var kursRouter = require("./routes/kurs");

var app = express();

// view engine setup
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layouts/",
    helpers: {
      genTable: require("./helpers/generateTable"),
      genMeineKurse: require("./helpers/generateMeineKurse"),
      genDisplayName: require("./helpers/generateDisplayName"),
      genSearchResult: require("./helpers/genSearchTable"),
      genFachlehrerLastBewertungen: require("./helpers/genFachlehrerLastBewertungen"),
      ifEqual: require("./helpers/conditionalHelper"),
      calcRows: require("./helpers/calcRows"),
      formatAnnouncements: require("./helpers/formatAnnouncements"),
      currentTime: require("./helpers/currentTime"),
      genMeineKlasseTable: require("./helpers/genMeineKlasseTable"),
      genMeineBewertungen: require("./helpers/genMeineBewertungen")
    }
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Morgan Logger
app.use(
  logger((tokens, req, res) => {
    if (tokens.method(req, res) == "POST") {
      return [
        datetime.create().format("m/d/Y H:M:S") + ": [",
        tokens.method(req, res),
        "] Url:",
        tokens.url(req, res),
        "Status: ",
        nodeStatusCodes[tokens.status(req, res)],
        "(",
        tokens.status(req, res),
        ")", "Content-length:",
        tokens.res(req, res, "content-length"),
        "Responsetime:",
        tokens["response-time"](req, res),
        "ms"
      ].join(" ");
    } else {
      return null;
    }
  })
);

app.use(favicon(__dirname + "/public/images/favicon.png"));

app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin); // also  tried "*" here
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(expressFileupload({
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: process.env.SESSION_RESAVE,
    store: sessionStore,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 60
    } /* Ein Nutzer bleibt maximal einen Tag eingeloggt (Default) */
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Checkt ob ein User eingeloggt ist
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  };
}

// Setting locals
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  if (res.locals.isAuthenticated) {
    res.locals.user_id = req.user.user_id;
    const db = require("./db");

    db.query(
      "SELECT * FROM user_db WHERE id = ?",
      [res.locals.user_id],
      (error, results, fields) => {
        if (error) return next(new Error(error.message));
        res.locals.permission = results[0].permission_flag;
        res.locals.username = results[0].username;
        res.locals.fullname = [results[0].vorname,results[0].nachname];
        res.locals.vorname = results[0].vorname;
        res.locals.nachname = results[0].nachname;
        res.locals.url = req.originalUrl; // Url wird benutzt um bei einem 404 Error anzuzeigen, welche Seite es nicht gibt

        // Schaut ob der Nutzer die Einführung absolviert hat, wenn nicht wird ein Tutorial auf der Hauptseite angezeigt
        if(results[0].hasDoneTutorial === "1"){
          res.locals.tutorial = false;
        }else{
          res.locals.tutorial = true;
        }

        console.log(
          [
            datetime.create().format("m/d/Y H:M:"),
            ": ",
            "[ NEW REQUEST ] Logged in User [user_id=",
            results[0].id,
            ", username='",
            results[0].username,
            "', type=",
            results[0].permission_flag, "]", " is accessing ", req.originalUrl
          ].join("")
        );
        
        // Wenn es sich um ein Fachlehrer oder einen Tutor hält werden seine Kurse lokal gespeichert um
        // diese später per HBS dynamisch zu rendern.

        if(res.locals.permission !== "admin"){
          db.query(
            "SELECT * FROM kurs_db WHERE lehrer_id = ?",
            [res.locals.user_id],
            (err, result) => {
              if (err) {
                return next(new Error(err.message));
              } else {
                res.locals.meineKurse = result;
                res.locals.kure_count = result.length;
                  // Sucht alle momentanen Ankündigungen für alle drei Arten von Benutzern
                  if(res.locals.permission === "fachlehrer"){
                  db.query(
                     "SELECT * FROM announcement_db WHERE (zielgruppe = 'Fachlehrer' OR zielgruppe = 'Fachlehrer und Tutoren' OR zielgruppe = 'Alle') AND NOT ( datum < NOW() - INTERVAL 30 DAY) LIMIT 5;",
                     (error, results, fields) => {
                      if(error) return next(new Error(error.message));
                      res.locals.announcements_count = results.length;
                      res.locals.announcements = results;
                      next();
                  });
                  }else if(res.locals.permission === "tutor"){
                    db.query(
                      "SELECT * FROM announcement_db WHERE (zielgruppe = 'Tutoren' OR zielgruppe = 'Fachlehrer und Tutoren' OR zielgruppe = 'Alle') AND NOT ( datum < NOW() - INTERVAL 30 DAY) LIMIT 5;",
                      (error, results, fields) => {
                        if(error) return next(new Error(error.message));
                        res.locals.announcements_count = results.length;
                        res.locals.announcements = results;
                        db.query(
                          "SELECT * FROM selg_schema.klasse_db WHERE lehrer_id = ?;", [res.locals.user_id],
                          (error, result) => {
                           if(error) return next(new Error(error.message));
                           res.locals.stufe = result[0].stufe;
                           res.locals.stufe_suffix = result[0].suffix;
                           next();
                       });
                   });
                  }
              }
            }
          );
        }else{
          // Sucht nach Ankündigungen für Administratoren
          db.query(
            "SELECT * FROM announcement_db WHERE (zielgruppe = 'Administratoren' OR zielgruppe = 'Fachlehrer und Tutoren' OR zielgruppe = 'Alle') AND NOT ( datum < NOW() - INTERVAL 30 DAY) LIMIT 5;",
            (error, results, fields) => {
              if(error) return next(new Error(error.message));
              res.locals.announcements = results;
              res.locals.announcements_count = results.length;
              next();
         });
        }
      }
    );
  } else {
    next();
  }
});

// Login kann als einzige Seite ohne Session betreten werden
app.use("/login", loginRouter);
app.use(authenticationMiddleware());

// Weiterer Zugriff wird nur gewährt, wenn der Nutzer angemeldet ist und eine gültige Session vorweisen kann
app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/error", errorRouter);
app.use("/admin", adminRouter);
app.use("/logout", logoutRouter);
app.use("/kurs", kursRouter);
app.use("/bewertung", bewertungRouter);

// Middlewear um sich anzumelden
passport.use(
  new LocalStrategy(function(username, password, done) {
    const db = getDB();
    db.query(
      "SELECT id, password FROM user_db WHERE username = ?",
      [username],
      (error, results, fields) => {
        if (error) {
          console.log("\tFaild Login");
          done(error);
        }
        if (results.length === 0) {
          console.log("\tFaild Login");
          done(null, false);
        } else {
          const hash = results[0].password.toString();
          bcrypt.compare(password, hash, (err, response) => {
            if (response === true) {
              console.log("\tNew Login: ID="+results[0].id);
              staticLogger.logSession();
              return done(null, { user_id: results[0].id });
            } else {
              console.log("\tFaild Login");
              return done(null, false);
            }
          });
        }
      }
    );
  })
);

// 404 Error wird erzeugt wenn nichts gefunden wird
app.use(function(req, res, next) {
  next(404);
});

// Error Handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message ||"404";
  res.locals.error = err;

  res.status(err.status || 500);

  var handlebars_presettings = {
    layout: res.locals.permission,
    location: "Error"
  };

  fs.appendFile(
    __dirname + "/log/server.log",
    [
      datetime.create().format("m/d/Y H:M:S") + ":",
      "ERROR",
      err.status,
      res.locals.message,
      "\r\n"
    ].join(" "),
    function(err) {
      if (err) return console.log(err);
    }
  );

  res.render("error", handlebars_presettings);
});

module.exports = app;

function getDB() {
  return require("./db");
}
