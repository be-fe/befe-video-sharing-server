var express = require('express');
var st = require('st');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.get('', function(req, res) {
    res.redirect('/index');
});
app.get('/static/index.html', function(req, res) {
    res.redirect('/index');
});

app.get('/index', function(req, res) {
    res.sendFile('./static/index.html', {
        root: __dirname
    });
});

require('./server/ajax').setup(app);

app.use(new st({
    path: './videos',
    url: '/videos'
}));

app.use(new st({
    path: './static',
    url: '/static',
    cache: false
}));

var config = require('./common/config.js');

var port = config.port;
console.log('Server opened at http://localhost:' + port);
app.listen(port);
