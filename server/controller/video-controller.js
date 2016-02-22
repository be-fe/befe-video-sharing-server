;
(function () {
    var fs = require('fs');
    var config;
    var npath = require('path');
    var SP = npath.sep;
    var locals = {};

    var videoLogic = {
        init: function(_config) {
            config = _config;
            locals.videoInfoPath = config.path.data + '/video-info.json';
        },
        dumpJson: function(path, data) {
            var json = JSON.stringify(data, null, '   ');
            fs.writeFileSync(path, json);
        },
        readJson: function(path) {
            var json = null;
            try {
                json = JSON.parse(fs.readFileSync(path));
            } catch (ex) { }
            return json;
        },
        readJsonOrCreate: function(path, defaultValue) {
            var json = this.readJson(path);
            if (!json) {
                this.dumpJson(path, defaultValue);
            }
            return defaultValue;
        },
        readVideoInfo: function() {
            var self = this;

            var videoInfo = self.readJson(locals.videoInfoPath);
            if (!videoInfo) {
                videoInfo = {
                    names: {}
                };
                self.dumpJson(locals.videoInfoPath, videoInfo);
            }
            return videoInfo;
        },
        writeVideoInfo: function(videoInfo) {
            var self = this;
            self.dumpJson(locals.videoInfoPath, videoInfo);
        },
        setVideoName: function(videoKey, videoName) {
            var videoInfo = videoLogic.readVideoInfo();
            var videoNames = videoInfo.names;
            videoNames[videoKey] = videoName;
            videoLogic.writeVideoInfo(videoInfo);
        },
        getSingleVideoInfoPath: function(videoKey) {
            return config.path.videos + SP + videoKey + SP + 'single-video-info.json';
        },
        readSingleVideoInfo: function(videoKey) {
            var self = this;
            var singleVideoInfo = self.readJsonOrCreate(self.getSingleVideoInfoPath(videoKey), {
                tags: []
            });
            return singleVideoInfo;
        },
        writeSingleVideoInfo: function(videoKey, singleVideoInfo) {
            var self = this;

            self.dumpJson(self.getSingleVideoInfoPath(videoKey), singleVideoInfo);
        }
    };

    module.exports = videoLogic;
})();