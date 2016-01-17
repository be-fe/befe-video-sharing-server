var fs = require('fs');

var config = {
    port: 3333,
    params: {
        CONTEXT: ''
    },
    tokenPass: 'a-secret-token-should-be-set-here'
};

var base = fs.realpathSync(__dirname + '/../');
config.path = {
    base: base,
    videos: base + '/videos/',
    tmpFiles: base + '/tmp-files/'
};

module.exports = config;