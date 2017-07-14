var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var liveintercom = require('./routes/liveintercom');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(function(req, res, next){
  res.io = io;
  next();
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/bower_components/', express.static(__dirname + '/bower_components/'));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/l', liveintercom);//某公司的livechat.com/room/companyId/roomId


app.use(express.static('public'))

app.use(function (req, res, next) {
    if ('/MP_verify_TneROHDiBDphZRvS.txt' == req.url) {
        res.type('text/plain')
        res.send("TneROHDiBDphZRvS");
    } else {
        next();
    }
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// module.exports = app;
module.exports = {app: app, server: server};
