var fs = require('fs');
var npath = require('path');
var config = require('../common/config');
var md5 = require('md5');
var utils = require('./util/utils');
var url = require('url');
var rmdir = require( 'rmdir' );

var _ = require('lodash');

var SP = npath.sep;

var multer = require('multer');
var upload = multer({
    //dest: './tmp-files/',
    limits: {
        fileSize: config.maxFileContentLength
    }
});

var videoLogic = require('./controller/video-controller');
videoLogic.init(config);

var tokens = {}, tokenCount = 0;

module.exports = {
    setup: function(app) {

        /*
          /ajax/upload-file requires:
            body:
               filePath - relative to videos/
               content - the content of the file

            all files should be sent to tmp-files/ first, and then be moved to
            video
         */
        app.post('/ajax/upload-file',
            upload.single('content'),
            function(req, res) {
            var body = req.body;
            console.log('request come with body: ', body);

            // ensure the request has a valid token hash (i.e. md5( tokenString ) )
            if (body.tokenHash && tokens[body.tokenHash]) {
                // make sure the tokens is not growing crazy
                delete tokens[body.tokenHash];
                tokenCount --;
            } else {
                res.send('invalid-token');
                return;
            }

            // get the file path from req
            var filePath = npath.resolve(config.path.videos + body.filePath);
            console.log('file path to write the file: %s', filePath);

            // ensure the file path is inside videos
            if (filePath.indexOf(config.path.videos) != 0) {
                res.send('invalid-file-path');
                return;
            }

            // ensure the dir is ready
            utils.mkdir(npath.dirname(filePath));
            fs.writeFileSync(filePath, req.file.buffer);
            res.send('ok');

            console.log(req.file);
            //console.log(body);
        });

        app.use('/ajax/request-token', function(req, res) {
            var token = md5(Math.random());
            var hash = md5(token + config.tokenPass);

            if (tokenCount > config.maxTokenCount) {
                tokens = {};
                tokenCount = 0;
            }

            tokens[hash] = new Date().getTime();
            tokenCount ++;
            console.log('token generated: %s with hash %s', token, hash);
            res.send(token);
        });

        /*
            check if the file exists under video,
            with the body.filePath
         */
        app.post('/ajax/check-file', function(req, res) {
            var body = req.body;

            console.log('checking file - ', req.body, config.path.videos + body.filePath);
            if (fs.existsSync(config.path.videos + body.filePath)) {
                res.send('yes');
            } else {
                res.send('no');
            }
        });


        app.post('/ajax/video-list', function(req, res) {
            var params = req.body;
            console.log(req.body);
            if (params.video) {
                var files = _.filter(fs.readdirSync(config.path.videos + params.video + '/video/'), function(file) {
                    return file.substr(0, 1) != '.';
                });
                res.send(files);
            } else {
                res.send([]);
            }
        });

        var adminToken = null;
        var checkAdminToken = function(tokenHash) {
            if (!adminToken) {
                adminToken = config.tokenPass;
            }

            if (md5(adminToken + config.params.tokenSalt) == tokenHash) {
                return true;
            } else {
                return false;
            }
        };

        var checkAdminTokenOrReturn = function(tokenHash, callback, res) {
            var checkResult = checkAdminToken(tokenHash);
            if (checkResult) {
                var result = callback();
                res.send({
                    status: 'ok',
                    result: result
                });
            } else {
                res.send({
                    status: 'error',
                    tokenSalt: config.params.tokenSalt
                });
            }
        };

        app.post('/ajax/remove-video', function(req, res) {
            var params = req.body;

            checkAdminTokenOrReturn(parasms.tokenHash, function() {
                console.log(config.path.videos + SP + params.videoKey);
                rmdir(config.path.videos + SP + params.videoKey);
                var videoInfo = videoLogic.readVideoInfo();
                delete videoInfo.names[params.videoKey];
                videoLogic.writeVideoInfo(videoInfo);
            }, res);
        });

        app.post('/ajax/rename-video', function(req, res) {
            var params = req.body;

            checkAdminTokenOrReturn(params.tokenHash, function() {
                var videoInfo = videoLogic.readVideoInfo();
                videoInfo.names[params.videoKey] = params.videoName;
                videoLogic.writeVideoInfo(videoInfo);
            }, res);
        });

        app.post('/ajax/all-videos', function(req, res) {
            var videos = fs.readdirSync(config.path.videos);
            var videoInfo = videoLogic.readVideoInfo();

            var videos = _.filter(videos, function(file) {
                return file.substr(0, 1) != '.';
            }).map(function(videoKey) {
                var videoName = videoInfo.names[videoKey] || videoKey;

                return {
                    key: videoKey,
                    name: videoName
                }
            });
            res.send(videos);
        });

        app.post('/ajax/set-tag', function(req, res) {
            var params = req.body;

            checkAdminTokenOrReturn(params.tokenHash, function() {
                var singleVideoInfo = videoLogic.readSingleVideoInfo(params.videoKey);

                if (params.tagId) {
                    var found = singleVideoInfo.tags.some(function(tag, tagIndex) {
                        if (tag.id == params.tagId) {
                            tag.name = params.tagName;
                            tag.timeId = params.tagTimeId;
                            return true;
                        } else if (tag.timeId == params.tagTimeId) {
                            return true;
                        }
                    });

                    if (!found) {
                        singleVideoInfo.tags.push({
                            id: params.tagId,
                            name: params.tagName,
                            timeId: params.tagTimeId
                        });
                    }
                }

                console.log(found, singleVideoInfo, params);

                videoLogic.writeSingleVideoInfo(params.videoKey, singleVideoInfo);
                return videoLogic.getVideoTags(params.videoKey, true);
            }, res);

        });

        app.post('/ajax/remove-tag', function(req, res) {
            var params = req.body;

            checkAdminTokenOrReturn(params.tokenHash, function() {
                var singleVideoInfo = videoLogic.readSingleVideoInfo(params.videoKey);

                for (var i = singleVideoInfo.tags.length; i-- > 0;) {
                    var tag = singleVideoInfo.tags[i];
                    if (tag.id == params.tagId) {
                        singleVideoInfo.tags.splice(i, 1);
                    }
                }

                videoLogic.writeSingleVideoInfo(params.videoKey, singleVideoInfo);
                return videoLogic.getVideoTags(params.videoKey, true);
            }, res);

        });

        app.post('/ajax/video-tags', function(req, res) {
            var params = req.body;

            var singleVideoInfo = videoLogic.readSingleVideoInfo(params.videoKey);
            res.send(singleVideoInfo.tags);
        });
    }
};