;
(function () {
    var fs = require('fs');
    var config;

    var videoLogic = {
        init: function(_config) {
            config = _config;
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
            var videoInfoPath = config.path.data + '/video-info.json';
            var self = this;

            var videoInfo = self.readJson(videoInfoPath);
            if (!videoInfo) {
                videoInfo = {};
                self.dumpJson(path, videoInfo);
            }
        }
    };

    module.exports = videoLogic;
})();