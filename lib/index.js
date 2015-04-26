var debug = require('debug')('app');
var pkg = require('../package');
var express = require('express');
var hbs = require('express-hbs');
var path = require('path');
var compression = require('compression');
var app = express();

app.set('name', pkg.name);
app.set('production', process.env.NODE_ENV === 'production');
app.set('version', pkg.version);
app.set('port', process.env.PORT || 8000);

// global template variables
var production = app.locals.production = process.env.NODE_ENV === 'production';
app.locals.version = pkg.version;
app.locals.port = app.get('port');
// anti-typo protection... ::sigh::
app.locals.cachebust = app.locals.cacheBust = production ? '?' + pkg.version : '';

app.engine('html', hbs.express3({
  extname: '.html',
  defaultLayout: path.resolve(__dirname + '/../views/layout.html'),
  partialsDir: [
    path.resolve(__dirname + '/../views/partials'),
  ],
}));

app.set('views', path.resolve(__dirname + '/../views'));
app.set('view engine', 'html');
app.set('view cache', false);

app.use(compression());

app.use('/', express.static(__dirname + '/../public', {
  maxAge: 365 * 24 * 60 * 60 * 1000,
}));

app.use('/', require('./routes'));

debug('listening');
app.listen(app.get('port'), function () {
  console.log(app.get('name') + ' v' + app.get('version')
    + ' is up and running on port ' + app.get('port') + '.');
});
