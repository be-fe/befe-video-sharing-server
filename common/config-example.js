var fs = require('fs');
var npath = require('path');

var config = {
    port: 3333,
    params: {
        context: ''
    },
    maxFileContentLength: 20 * 1024 * 1024,
    maxTokenCount: 20000,
    tokenPass: 'a-secret-token-should-be-set-here'
};

var base = npath.resolve(__dirname + '/../');
config.path = {
    base: base,
    videos: npath.resolve(base + '/videos/') + '/',
    tmpFiles: npath.resolve(base + '/tmp-files/') + '/'
};

module.exports = config;