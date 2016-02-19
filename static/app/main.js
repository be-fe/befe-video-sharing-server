;
(function ($, _, g) {
    'use strict';

    var vars = {
        context: '',
        tokenSalt: ''
    };

    var tpls = _.reduce(g.rawTpls, function(result, curr, key) {
        result[key] = _.template(curr, {variable: 'd'});
        return result;
    }, {});

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
        manualChangeHash: function(hash) {
            this.isManualHashChange = true;
            location.hash = hash;
        },
        onHashChange: function(callback) {
            $(window).on('hashchange', function() {
                if (!this.isManualHashChange) {
                    callback && callback();
                } else {
                    this.isManualHashChange = false;
                }
            });

            // init call
            callback && callback();
        },

        url: function(path) {
            return vars.context + path;
        },

        loadVideos: function() {
            $.post(methods.url('/ajax/all-videos'), function(videos) {
                console.log('all videos: ', videos);

                videos.forEach(function(video) {

                    var videoHtml = tpls.sidebarVideo({
                        videoKey: video.key,
                        videoText: video.name.split('_').join(' ')
                    });

                    var $video = $(videoHtml);
                    $video.data('video', video);
                    $els.videoList.append($video);
                });
            });
        },

        localStorageKey: 'befe_video_sharing_',
        setItem: function(key, data) {
            localStorage.setItem(this.localStorageKey + key, JSON.stringify(data));
        },
        getItem: function(key) {
            var data = null;
            try {
                data = JSON.parse(localStorage.getItem(this.localStorageKey + key));
            } catch(ex) {}
            return data;
        }
    };

    var $els = {};

    var main = {
        init: function (opts) {
            _.extend(vars, opts);

            var player = new ClipPlayer();
            player.init($('#player'));

            $els.sidebar = $('#sidebar');
            $els.body = $(document.body);
            $els.videoList = $els.sidebar.find('.video-list');

            var initParams = methods.parseHashParams();

            $els.body.toggleClass('sidebar-shown', !initParams.video);

            methods.onHashChange(function() {
                var params = methods.parseHashParams();

                $.post(methods.url('/ajax/video-list'), {
                    video: params.video
                }, function(clipList) {
                    player.setPlayList(clipList, methods.url('/videos/' + params.video + '/video/'));
                    player.playAtTime(0);
                });

                // 目标params - {video, t, search}
                console.log(params);
            });

            methods.loadVideos();

            this.initPage();

            // main.openAdminDialog();
        },

        openEditVideo: function(video) {
            var self = this;

            var dialogId = $(vex.dialog.open({
                message: '修改视频',
                input: tpls.editVideo({
                    videoKey: video.key,
                    videoName: video.name
                }),
                callback: function(data) {

                }
            })).data().vex.id;

            $('#edit-video').on('click', '.remove-video', function(e) {
                console.log('remove video ', video);

                vex.dialog.confirm({
                    message: '是否确认删除视频 : ' + video.name + ' #id(' + video.key + ') ?',
                    callback: function(data) {
                        if (data) {
                            $.post(methods.url('/ajax/remove-video'), {
                                tokenHash : md5(methods.getItem('admin_token') + vars.tokenSalt),
                                videoKey : video.key
                            }, function(result) {
                                if (result != 'ok') {
                                    vars.tokenSalt = result;
                                    self.openAdminDialog();
                                } else {
                                    $els.videoList.find('[video-key=' + video.key + ']').remove();
                                    vex.close(dialogId);
                                }
                            });
                        }
                    }
                });
            });
        },

        openAdminDialog: function() {
            vex.dialog.open({
                message: '做任何修改操作前请先输入管理员token, 请联系 zhengliangliang@baidu.com',
                input: tpls.adminToken(),
                callback: function(data) {
                    if (data) {
                        methods.setItem('admin_token', data['admin-token']);
                    }
                }
            });

            $('[name=admin-token]').focus();
        },

        initPage: function() {
            var self = this;

            $els.sidebar.on('click', '.handle', function() {
                $els.body.toggleClass('sidebar-shown');
            });

            $els.videoList.on('click', '.edit', function(e) {
                var $a = $(this).parent();
                self.openEditVideo($a.data('video'));

                e.stopPropagation();
                e.preventDefault();
            });
        }
    };
    g.main = g.main || main;

})(jQuery, _, window);