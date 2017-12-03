let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let debug = require('debug')('twiter-scraping:server');
let http = require('http');
let session = require('express-session')
let flash    = require('connect-flash');
let passport = require('passport');
let passportSetting = require(__dirname+'/modules/passport.js');
let mongoose = require('mongoose');

let streamConf = require(__dirname+'/modules/streamConf.js');

let routes = require(__dirname+'/modules/routes.js');

let app = express();
mongoose.connect('mongodb://test:test@ds129706.mlab.com:29706/twiter', {useMongoClient: true});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//app.disable('etag');
passportSetting(passport);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// required for passport
app.use(session({
  secret: 'ilovescotchscotchyscotchscotch',
  resave: true,
  saveUninitialized: true,
  store: new (require('express-sessions'))({
    storage: 'mongodb',
    instance: mongoose, // optional 
    host: 'mlab.com', // optional 
    port: 29706, // optional 
    db: 'twitter', // optional 
    collection: 'sessions', // optional 
    expire: 86400 // optional 
})
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

app.use(express.static(path.join(__dirname, 'resources')));


let server = http.createServer(app);


/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || '3002');
app.set('port', port);

/**
 * Create HTTP server.
 */

/**
 * Listen on provided port, on all network interfaces.
 */

routes = routes( app, passport);


server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

let io = require('socket.io').listen(server);

streamConf.io = io;
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  //debug('Listening on ' + bind);
  console.log('Listening on ' + bind);
}


// module.exports = app;
