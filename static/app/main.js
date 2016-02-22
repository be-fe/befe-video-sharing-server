;
(function ($, _, g) {
    'use strict';

    var vars = {
        context: '',
        tokenSalt: '',
        tagHash: {}
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
        },

        getTokenHash: function() {
            return md5(methods.getItem('admin_token') + vars.tokenSalt);
        },

        attrSelector: function(attr, value) {
            return '[' + attr + '="' + value.split('"').join('\\"') + '"]';
        },

        getTagId: function() {
            return new Date().getTime().toString(36) + '_' + Math.round(Math.random() * Math.pow(36, 6)).toString(36);
        },

        parseTimeId: function(timeId) {
            timeId = Math.floor(timeId);
            return Math.floor(timeId / 60) + ':' + (timeId % 60);
        },

        resolveTime: function(timeText) {
            timeText = _.trim(timeText);
            var parts = timeText.split(':');
            return ~~parts[0] * 60 + ~~parts[1];
        }

    };

    var $els = {};
    var player = new ClipPlayer();

    var main = {
        init: function (opts) {
            _.extend(vars, opts);
            player.init($('#player'));
            var self = this;

            $els.sidebar = $('#sidebar');
            $els.body = $(document.body);
            $els.videoList = $els.sidebar.find('.video-list');
            $els.tagList = $els.sidebar.find('.tag-list');

            var initParams = methods.parseHashParams();

            $els.body.toggleClass('sidebar-shown video-tab-shown', !initParams.video);
            vars.videoKey = initParams.video;

            methods.onHashChange(function() {
                var params = methods.parseHashParams();

                $.post(methods.url('/ajax/video-list'), {
                    video: params.video
                }, function(clipList) {
                    player.setPlayList(clipList, methods.url('/videos/' + params.video + '/video/'));
                    player.playAtTime(0);
                });

                $.post(methods.url('/ajax/video-tags'), {
                    videoKey: params.video
                }, function(tags) {
                    self.renderTags(tags);
                });

                // 目标params - {video, t, search}
                console.log(params);
            });

            methods.loadVideos();

            this.initPage();

            // main.openAdminDialog();
        },

        checkSimpleActionAuth: function(result, success) {
            var self = this;

            if (result.status != 'ok') {
                vars.tokenSalt = result.tokenSalt;
                self.openAdminDialog();
            } else {
                success(result);
            }
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
                    if (!data) {
                        return;
                    }

                    if (!_.trim(data['video-name'])) {
                        vex.dialog.alert('视频名字不能为空.');
                        return;
                    }

                    $.post(methods.url('/ajax/rename-video'), {
                        tokenHash: methods.getTokenHash(),
                        videoKey: video.key,
                        videoName: data['video-name']
                    }, function(result) {
                        main.checkSimpleActionAuth(result, function() {
                            $els.videoList.find(methods.attrSelector('video-key', video.key))
                                .find('.video-name')
                                .text(data['video-name']);

                            video.name = data['video-name'];
                        });
                    });
                }
            })).data().vex.id;

            $('#edit-video').on('click', '.remove-video', function(e) {
                console.log('remove video ', video);

                vex.dialog.confirm({
                    message: '是否确认删除视频 : ' + video.name + ' #id(' + video.key + ') ?',
                    callback: function(data) {
                        if (data) {
                            $.post(methods.url('/ajax/remove-video'), {
                                tokenHash : methods.getTokenHash(),
                                videoKey : video.key
                            }, function (result) {
                                main.checkSimpleActionAuth(result, function() {
                                    $els.videoList.find(methods.attrSelector('video-key', video.key)).remove();
                                    vex.close(dialogId);
                                })
                            });
                        }
                    }
                });
            });
        },

        openEditTag: function(tag) {
            var self = this;
            if (!tag) {
                tag = {
                    timeId: player.getCurrentTimeId() || 0,
                    name: '未命名标签'
                }
            }

            vex.dialog.open({
                message: '设置视频时间点',

                input: tpls.editTag({
                    tagTimeId: methods.parseTimeId(tag.timeId),
                    tagName: tag.name
                }),

                callback: function(data) {
                    if (data) {
                        var time = methods.resolveTime(data['tag-time']);
                        if (time) {
                            tag.timeId = time;
                            tag.name = data['tag-name'];
                            var isNew = false;
                            if (!tag.id) {
                                tag.id = methods.getTagId();
                                isNew = true;
                            }

                            $.post(methods.url('/ajax/set-tag'), {
                                isNew: isNew,
                                tagId: tag.id,
                                tagName: tag.name,
                                tagTimeId: tag.timeId
                            }, function(tags) {
                                self.renderTags(tags);
                            });
                        }
                    }
                }
            });

            $('#edit-video').find('.tag-name').focus();
        },

        renderTags: function(tags) {
            vars.tags = tags;
            vars.tagHash = {};
            $els.tagList.empty();
            vars.tags.forEach(function(tag) {
                vars.tagHash[tag.timeId] = tag;

                var $videoTag = $(tpls.sidebarVideoTag({
                    videoKey: params.video,
                    tagTime: methods.parseTimeId(tag.timeId),
                    tagName: tag.name
                }));

                $els.tagList.append($videoTag);
            });
        },

        filterVideos: function(keywordText) {
            var keywords = _.trim(keywordText).split(/\s+/);

            $els.videoList.find('.video')
                .each(function() {
                    var $video = $(this);
                    var video = $video.data('video');

                    if (keywords.every(function(keyword) {
                        return video.name.indexOf(keyword) != -1
                    })) {
                        $video.attr('filter-hidden', 'false');
                    } else {
                        $video.attr('filter-hidden', 'true');
                    }
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
            }).on('keyup', '.search-bar', _.debounce(function() {
                var keywordText = $(this).val();

                main.filterVideos(keywordText);
            }, 200)).on('click', '.add-video-tag', function() {
                if (!vars.videoKey) {
                    vex.dialog.alert('没有任何视频正在播放.');
                } else if (vars.tagHash[player.getCurrentTimeId()]) {
                    main.openEditTag(vars.tagHash[player.getCurrentTimeId()]);
                } else {
                    main.openEditTag();
                }
            });

            $els.videoList.on('click', '.edit', function(e) {
                var $a = $(this).parent();
                self.openEditVideo($a.data('video'));

                e.stopPropagation();
                e.preventDefault();
            });


            player.on(player.eventNames.onTimeChanged, function(video) {

            });
        }

    };

    g.main = g.main || main;

})(jQuery, _, window);