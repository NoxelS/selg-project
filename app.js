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

// Authentication Packages
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var MySQLStore = require("express-mysql-session")(session);
var bcrypt = require("bcrypt");

// MySQL Session Storage
var sessionStore = new MySQLStore({
  host: "192.168.178.37",
  port: "3306",
  user: "node_connection",
  password: "a&r6a90$48|wfa9awfg8wgaa9a0gag0ga0ag0ffaffm0=",
  database: "selg_schema"
});

var fileLogger = require("./log/file-logger");
fileLogger.log();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var loginRouter = require("./routes/login");
var errorRouter = require("./routes/error");
var adminRouter = require("./routes/admin");
var logoutRouter = require("./routes/logout");
var bewertungRouter = require("./routes/bewertung");

var app = express();

// view engine setup
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layouts/"
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Morgan Logger -> Logs to Console & /log/server.los
app.use(
  logger((tokens, req, res) => {
    fs.appendFile(
      __dirname + "/log/server.log",
      [
        datetime.create().format("m/d/Y H:M:S") + ": [",
        tokens.method(req, res),
        "] Url:",
        tokens.url(req, res),
        "FileType(ending):",
        tokens
          .url(req, res)
          .split("/")
          [tokens.url(req, res).split("/").length - 1].split(".")
          .reverse()[0],
        "\tStatus: ",
        nodeStatusCodes[tokens.status(req, res)],
        "(",
        tokens.status(req, res),
        ")",
        tokens.res(req, res, "content-length"),
        "Responsetime:",
        tokens["response-time"](req, res),
        "ms",
        "\r\n"
      ].join(" "),
      function(err) {
        if (err) return console.log(err);
      }
    );

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

// @TODO
app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin); // also  tried "*" here
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
  session({
    secret: "w4wafafwetgfelfwa#24ns42indawfwol",
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60
    } /* Ein Nutzer bleibt maximal eine stunde eingeloggt */
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Checks if User is signedin -> If not: redirect to /login
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
        if (error) throw error;
        res.locals.permission = results[0].permission_flag;
        res.locals.username = results[0].username;
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
        next();
      }
    );
  } else {
    next();
  }
});

// /login can be visited wihout session
app.use("/login", loginRouter);
app.use(authenticationMiddleware());

// further access is only granted when a permission_flag is set
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/error", errorRouter);
app.use("/admin", adminRouter);
app.use("/logout", logoutRouter);
app.use("/bewertung", bewertungRouter);

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

/*
 app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie('user_sid');        
  }
  next();
});
*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(404);
});

// error handler
app.use(function(err, req, res, next) {
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
});

module.exports = app;

function getDB() {
  return require("./db");
}
