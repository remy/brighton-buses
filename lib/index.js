
const debug = require('debug')('app');
const express = require('express');
const hbs = require('express-hbs');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const pkg = require('../package');
const app = express();

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
}));

app.set('views', path.resolve(__dirname + '/../views'));
app.set('view engine', 'html');
app.set('view cache', false);
app.set('trust proxy', 1) // trust first proxy

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
