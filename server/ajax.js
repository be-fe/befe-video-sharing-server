var fs = require('fs');
var npath = require('path');
var config = require('../common/config');
var md5 = require('md5');
var utils = require('./util/utils');
var url = require('url');

var multer = require('multer');
var upload = multer({
    //dest: './tmp-files/',
    limits: {
        fileSize: config.maxFileContentLength
    }
});

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
        app.post(config.params.context + '/ajax/upload-file',
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

        app.use(config.params.context + '/ajax/request-token', function(req, res) {
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
        app.post(config.params.context + '/ajax/check-file', function(req, res) {
            var body = req.body;

            console.log('checking file - ', req.body, config.path.videos + body.filePath);
            if (fs.existsSync(config.path.videos + body.filePath)) {
                res.send('yes');
            } else {
                res.send('no');
            }
        });


        app.get(config.params.context + '/ajax/video-list', function(req, res) {
            var params =  url.parse(req.url, true).query;
            if (params.video) {
                var files = fs.readdirSync(config.path.videos + params.video + '/video/');
                res.send(files);
            } else {
                res.send([]);
            }
        });
    }
};