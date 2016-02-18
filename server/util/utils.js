var fs = require('fs');
var npath = require('path');
var config = require('../../common/config');
var _ = require('lodash');
var md5 = require('md5');

module.exports = {
    processConfig: function(config) {
        var self = this;

        config.params.tokenSalt = md5(Math.random() + new Date().getTime());

        _.extend(config.path, {
            adminTokenFile: config.path.data + '/admin-token.txt'
        });

        if (!fs.existsSync(config.path.adminTokenFile)) {
            console.log('请确保 %s 存在并配置好, 请参照 doc/admin-token.example.txt', config.path.adminTokenFile);
            process.exit(0);
        }
        self.mkdir(config.path.data);
        self.mkdir(config.path.videos);
        self.mkdir(config.path.tmpFiles);
    },
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
            info = this.setVideoInfo({
                videoInfo: config.videoInfo
            });
        }

        return info;
    },
    setVideoInfo: function(info) {
        console.log(info, config.videoInfo);
        fs.writeFileSync(config.videoInfo, JSON.stringify(info, null, '   '));
        return info;
    }
};