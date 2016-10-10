var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var GitBookStrategy = require('passport-gitbook');
var randtoken = require('rand-token');
var fs = require('fs');

var config = require('./config/config.json');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

import { User } from './models';

const util = require('util');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Setup passport
passport.use(new GitBookStrategy({
    clientID: config[app.settings.env].gitbook.clientId,
    clientSecret: config[app.settings.env].gitbook.clientSecret,
    callbackURL: config[app.settings.env].gitbook.callbackURL,
  },
  function(accessToken, refreshToken, profile, done) {
    User
      .findOrCreate({
        where: {
          uid: profile.id
        },
        defaults: {
          uid: profile.id,
          username: profile.username,
          password: randtoken.generate(16),
          profileURL: profile._json.urls.profile,
          starsURL: profile._json.urls.stars,
          token: accessToken,
          authToken: profile._json.auth.token,
        }
      })
      .then((users) => {
        done(null, users[0]);
      });
  }
));

passport.serializeUser((user, done) => {
  console.log(`===> ${user.uid}`);
  done(null, user.uid);
});

passport.deserializeUser((uid, done) => {
  User
    .findOne({ uid: uid })
    .then((user) => {
      done(null, user);
    });
});

app.get('/apple-app-site-association', (req, res, next) => {
  var config = fs.readFileSync(__dirname + '/config/apple-app-site-association.json');
  res.set('Content-Type', 'application/pkcs7-mime');
  res.status(200).send(config);
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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


module.exports = app;
