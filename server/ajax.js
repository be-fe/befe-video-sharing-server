var fs = require('fs');
var config = require('../common/config');
var md5 = require('md5');
var utils = require('./util/utils');

var tokens = {};

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
        app.post('/ajax/upload-file', function(req, res) {
            var body = req.body;

            // ensure the request has a valid token hash (i.e. md5( tokenString ) )
            if (body.tokenHash && tokens[body.tokenHash]) {
                delete tokens[body.tokenHash];
            } else {
                res.send('no-token');
                return;
            }

            // make sure the file content exists and it doesn't exceed the MAX file content size
            if (body.content && body.content.length < config.maxFileContentLength) {

                // get the file path from req
                var filePath = fs.realpathSync(config.path.videos + body.filePath);

                // ensure the file path is inside videos
                if (filePath.indexOf(config.path.videos) != 0) {
                    res.send('invalid-file-path');
                    return;
                }

                // ensure the dir is ready
                utils.mkdir(dirname(body.filePath));
                fs.writeFileSync(filePath, body.content);
                res.send('ok');
            }
            console.log(body);
        });

        app.use('/ajax/request-token', function(req, res) {
            var token = md5(Math.random());
            tokens[md5(token + config.tokenPass)] = new Date().getTime();
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
    }
};