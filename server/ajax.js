
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

        /*
            check if the file exists under video,
            with the body.filePath
         */
        app.post('/ajax/check-file', function(req) {
            var body = req.body;

        });
    }
};