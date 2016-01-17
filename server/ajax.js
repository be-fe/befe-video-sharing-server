var fs = require('fs');
var config = require('../common/config');
var md5 = require('md5');

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
        app.post('/ajax/upload-file', function(req) {
            var body = req.body;
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