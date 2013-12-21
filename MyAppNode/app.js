var express = require('express')
    , http = require('http')
    , pages = require('./routes/pages')
    , Facebook = require('facebook-node-sdk');

var app = express();
init_app();

// routes
app.get('/', Facebook.loginRequired('/'), pages.login);




http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});





function init_app() {
  app.set('port', process.env.PORT || 8080);
  app.use(express.favicon());

  // Set up view engine
  app.engine('html', require('hogan-express'));
  app.set('views', __dirname + '/templates');
  app.set('view engine', 'html');
  app.set('layout', 'base');

  // Sessions
  app.use(express.cookieParser('chyllio-secret'));
  app.use(express.session({cookie: {maxAge: 1000*60*60}}));
  app.use(Facebook.middleware({ appId: '588423224562138', secret: 'a2801d28795e4b9f42e3f8f101e7fb3b' }));

  // Always pass messages & logged in username through to template
  app.use(function(req, res, next) {
    res.locals.authUsername = req.session.username;

    var message = req.session.message;
    if (message) {
      res.locals.message = message;
      req.session.message = null;
    }

    next();
  });

  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(function(err, req, res, next) {
    if(err) {
        console.error(err.stack);
        res.send("ERROR!");
    } else {
        next();
    }
  });

  app.use('/static', express.static(__dirname + '/static'));
  app.use('/cache', express.static(__dirname + '/cache'));

  if (app.get('env') == 'development') {
    app.use(express.errorHandler());
  }
}