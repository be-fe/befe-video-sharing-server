;
(function ($, _, g) {

    var vars = {
        context: ''
    };

    var methods = {
        parseHashParams: function (paramString) {
            if (typeof paramString == 'undefined') {
                paramString = location.hash;
            }
            paramString = paramString && paramString.replace(/^#/, '') || '';

            var paramObject = {};
            paramString.split('&')
                .map(function (pairString) {
                    var pair = pairString.split('=');
                    var key = _.trim(decodeURIComponent(pair[0] || ''));
                    var value = _.trim(decodeURIComponent(pair[1] || ''));

                    if (key) {
                        paramObject[key] = value;
                    }
                }
            );

            return paramObject;
        },

        getHashParamStr: function (paramObject) {
            var paramString = Object.keys(paramObject)
                .map(function (key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(paramObject[key])
                }).join('&');
            return paramString;
        },

        isManualHashChange: false,
        manualHashChangeTimer: null,
        manualChangeHash: function() {
            this.isManualHashChange = true;
            clearTimeout(this.manualHashChangeTimer);
            this.manualHashChangeTimer = setTimeout(function() {
                this.isManualHashChange = false;
            }, 12);
        },
        onHashChange: function(callback) {
            $(window).on('hashchange', function() {
                if (!this.isManualHashChange) {
                    callback && callback();
                }
            });

            // init call
            callback && callback();
        },

        url: function(path) {
            return vars.context + path;
        }
    };

    var main = {
        init: function (opts) {
            _.extend(vars, opts);

            var player = new ClipPlayer();
            player.init($('#player'));

            methods.onHashChange(function() {
                var params = methods.parseHashParams();

                $.get(methods.url('/ajax/video-list'), {
                    video: params.video
                }, function(clipList) {
                    player.setPlayList(clipList, methods.url('/videos/' + params.video + '/video/'));
                    player.playAtTime(0);
                });

                // 目标params - {video, t, search}
                console.log(params);
            });
        }
    };
    g.main = g.main || main;
})(jQuery, _, window);