var _ = require('lodash');
var npath = require('path');

var SP = npath.sep;

var config = {
    root: npath.resolve(__dirname + '/../') + SP
};

_.extend(config, {
    src: config.root + 'static' + SP + 'app' + SP
});

module.exports = config;