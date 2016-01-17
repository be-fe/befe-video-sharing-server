var fs = require('fs');
var npath = require('path');

module.exports = {
    // some util functions
    mkdir: function(path) {
        if (!fs.existsSync(path)) {
            this.mkdir(npath.dirname(path));
            fs.mkdirSync(path);
        }
    }
};