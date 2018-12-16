var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var datetime = require('node-datetime');
var fs = require('fs');
var nodeStatusCodes = require('node-status-codes');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');

var app = express();

// view engine setup
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/'
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Morgan Logger -> Logs to Console & /log/server.los
app.use(logger((tokens, req, res) => {
  fs.appendFile(__dirname + "/log/server.log",
    [ datetime.create().format('m/d/Y H:M:S')+": [",
      tokens.method(req, res), "] Url:",
      tokens.url(req, res),"\tStatus: ",
      nodeStatusCodes[tokens.status(req, res)],"(",tokens.status(req, res),")",
      tokens.res(req, res, 'content-length'), 'Responsetime: ',
      tokens['response-time'](req, res), 'ms', "\r\n"
    ].join(' '), function (err) {
        if (err) return console.log(err);
      }
  );
  return [
    datetime.create().format('m/d/Y H:M:S')+": [",
    tokens.method(req, res), "] Url-Ending:",
    tokens.url(req, res).split("/")[tokens.url(req, res).split("/").length-1].split(".").reverse()[0],"\tStatus: ",
    nodeStatusCodes[tokens.status(req, res)],"(",tokens.status(req, res),")",
    tokens.res(req, res, 'content-length'), 'Rt: ',
    tokens['response-time'](req, res), 'ms'
    ].join(' ')
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next((404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(JSON.stringify(err));
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(JSON.stringify(err));
  res.render('error');
});

module.exports = app;
