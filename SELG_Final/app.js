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
var bcrypt = require('bcrypt')

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
        "\tStatus: ",
        nodeStatusCodes[tokens.status(req, res)],
        "(",
        tokens.status(req, res),
        ")",
        tokens.res(req, res, "content-length"),
        "Responsetime: ",
        tokens["response-time"](req, res),
        "ms",
        "\r\n"
      ].join(" "),
      function(err) {
        if (err) return console.log(err);
      }
    );
    return [
      datetime.create().format("m/d/Y H:M:S") + ": [",
      tokens.method(req, res),
      "] Url-Ending:",
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
      "Rt: ",
      tokens["response-time"](req, res),
      "ms"
    ].join(" ");
  })
);

app.use(favicon(__dirname + "/public/images/favicon.png"));

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin); // also  tried "*" here
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Origin', '*');
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
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());


// Checks if User is signedin -> If not: redirect to /login
function authenticationMiddleware() {
  return (req, res, next) => {
    console.log(
      `req.session.passport.user: ${JSON.stringify(req.session.passport)}`
    );
    if (req.isAuthenticated()) return next();
      res.redirect("/login");
  };
}

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});


// /login can be visited wihout session
app.use("/login", loginRouter);
app.use(authenticationMiddleware());
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/error", errorRouter);
app.use("/admin", adminRouter);
app.use("/logout", logoutRouter);

passport.use(new LocalStrategy(
  function(username, password, done) {
    
    console.log(username);
    console.log(password);

    const db = newFunction();
    console.log("DB connected")

    db.query('SELECT id, password FROM user_db WHERE username = ?', [username], (error, results, fields) => {
      // Datenbank error
      if (error) {done(error)}

      // Benutzername nicht gefunden
      if(results.length === 0){

        done(null, false);
      }else{

        // Password von der Datenbank
        const hash = results[0].password.toString();

        bcrypt.compare(password, hash, (err, response) => {
          if(response === true) {
            console.log(results[0].id);
            return done(null, {user_id: results[0].id});
          }else{
            return done(null, false);
          }
        });
      }
    });
  }
));

/*
// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
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
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);

  res.render("error");
});

module.exports = app;
function newFunction() {
  return require('./db');
}

