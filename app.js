'use strict';
var debug = require('debug');
var express = require('express');
var https = require('https');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var compression = require('compression');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');
var RateLimit = require('express-rate-limit'); ///https://github.com/nfriedly/express-rate-limit
var ws = require('ws');
var config = require('./config.json');
var auth = require('./services/auth');
var dataDir = require('./services/lnddir');
var sock = require('./sockroutes/wss');

var limiter = new RateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 300, // limit each IP to 300 requests per windowMs. Average 5 requests in each second.
    delayMs: 0 // disable delaying - full speed until the max limit is reached
});

var app = express();
app.use(cookieParser(config.cookieSecret));
app.use(limiter);
app.disable('x-powered-by');
app.use(compression());

//Authentication
app.use(auth);

// view engine setup
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(favicon(__dirname + '/public/images/lightning.jpg'));
app.use(expressLayouts);

app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.locals.applocals = {
        header: 'Welcome To Lightning Network !',
        header_small: '',
        pub_key: '',
    };

    next();
});

addRoutes('', 'routes');

function addRoutes(routepath, dirpath) {
    var files = fs.readdirSync(dirpath);
    files.forEach(function (file) {
        if (file.indexOf('.') == -1) { 
            addRoutes(routepath + '/' + file, dirpath + '/' + file);
        }
        else {
            var filename = file.replace('.js', '');
            var route = routepath + '/';
            if (filename != 'index') {
                route = route + filename;
            }
            app.use(route, require('./' + dirpath + '/' + filename));
        }
    });
}



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use(function (err, req, res, next) {
    res.status(err.status || 500).send("An error occured: " + err.message);
    return;
});

app.set('port', process.env.PORT || config.guiport || 8888);

var tls = {
    key: fs.readFileSync(config.tlsKey ? config.tlsKey : path.join(dataDir, "tls.key")),
    cert: fs.readFileSync(config.tlsCert ? config.tlsCert : path.join(dataDir, "tls.cert"))
};

if (config.tlsCA)
    tls.ca = config.tlsCA

var server = https.createServer(tls, app);


//start websocket server
var wss = sock(server);

server.listen(app.get('port'), config.host || "127.0.0.1", function () {
    debug('Server listening on port ' + server.address().port);
});

if (config.enableHttpRedirect && config.httpRedirectPort) {
    var http = require('http');

    var newapp = express();

    // set up plain http server
    var redirectServer = http.createServer(newapp);

    // set up a route to redirect http to https
    redirectServer.get('*', function (req, res) {
        res.redirect('https://' + req.headers.host + req.url);
    })

    // have it listen on 8080
    http.listen(config.httpRedirectPort);

}




