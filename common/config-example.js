var fs = require('fs');
var npath = require('path');
var utils = require('../server/util/utils');

var config = {
    port: 3333,
    params: {
        context: ''
    },
    maxFileContentLength: 20 * 1024 * 1024,
    maxTokenCount: 20000,
    tokenPass: 'a-secret-token-should-be-set-here',
    videoInfo: './video-info.json'
};

var base = npath.resolve(__dirname + '/../');
config.path = {
    base: base,
    data: npath.resolve(base + '/data/') + '/',
    videos: npath.resolve(base + '/videos/') + '/',
    tmpFiles: npath.resolve(base + '/tmp-files/') + '/'
};

utils.processConfig(config);

module.exports = config;