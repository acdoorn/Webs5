var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();


// error handler
app.handleError = function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
};

app.Mongoose = require('./config/database')();

app.Model = {};
app.Model.Place = require('./models/place')(app.Mongoose, app.Model, app.handleError);
// app.Model.Waypoint = require('./models/waypoint')(app.Mongoose, app.Model, app.handleError);
// app.Model.Race = require('./models/race')(app.Mongoose, app.Model, app.handleError);
// app.Model.User = require('./models/user')(app.Mongoose, app.Model, app.handleError);
// app.Model.TestData = require('./models/testData')(app.Model);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var places = require('./routes/places')(app.Model, app.handleError);

app.use('/', index);
app.use('/users', users);
app.use('/places', places);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



module.exports = app;

