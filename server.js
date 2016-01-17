var express = require('express');
var st = require('st');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();

var config = require('./common/config.js');
app.use(bodyParser.urlencoded({extended: true}));

app.get('', function(req, res) {
    res.redirect('/index');
});
app.get('/static/index.html', function(req, res) {
    res.redirect('/index');
});

app.get('/index', function(req, res) {
    var fileContent = fs.readFileSync('./static/index.html').toString();
    res.send(fileContent.replace(/@([^@]+)@/g, function(match, key) {
        if (config.params[key]) {
            return config.params[key];
        } else {
            return '';
        }
    }));
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


var port = config.port;
console.log('Server opened at http://localhost:' + port);
app.listen(port);
