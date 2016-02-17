;
(function () {
    var fs = require('fs');
    var config;

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
        }
    };

    module.exports = videoLogic;
})();