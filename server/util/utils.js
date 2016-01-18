var fs = require('fs');
var npath = require('path');
var config = require('../../common/config');

module.exports = {
    // some util functions
    mkdir: function(path) {
        if (!fs.existsSync(path)) {
            this.mkdir(npath.dirname(path));
            fs.mkdirSync(path);
        }
    },
    getVideoInfo: function() {
        try {
            var info = JSON.parse(fs.readFileSync(config.videoInfo).toString());
        } catch(ex) {}
        if (!info) {
            info = this.setVideoInfo({});
        }

        return info;
    },
    setVideoInfo: function(info) {
        fs.writeFileSync(config.videoInfo, JSON.stringify(info, null, '   '));
        return info;
    }
};