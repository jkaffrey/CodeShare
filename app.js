'use strict';

require('dotenv').config();
var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();
var io = require('socket.io').listen(app.listen(3000));
var expressJWT = require('express-jwt');
var cookieSession = require('cookie-session');
var multer = require('multer');
const errors = require('./helpers/errorStandards');

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './public/profilePics');
  },
  filename: function(req, file, callback) {
    if (file) {
      callback(null, file.fieldname + '-' + Date.now() + Math.random().toString(36).substring(3) + '.' + (file.mimetype.split('/')[1]));
    }
  }
});

var upload = multer({ storage: storage }).single('userPhoto');

// view handlebars setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');


//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1); // trust first proxy
app.use(cookieSession({
  name: 'session',
  keys: [process.env.C_SECRET_0, process.env.C_SECRET_1]
}));
app.use(function(req,res,next){
  res.locals.session = req.session;
  next();
});

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,accept,access_token,X-Requested-With');
  next();
});

require('./routes/index')(app, io, router);
require('./routes/auth')(app, multer, upload);
require('./routes/users')(app, router);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

//unauthorized error handler
app.use(function(err, req, res, next) {
  if (err.status === 401) {
    res.status(401).send({
      message: errors.unauthorizedRequest,
      status: 401,
      error: err.inner.message
    });
  } else {
    next();
  }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//app.listen(8080);

module.exports = app;
