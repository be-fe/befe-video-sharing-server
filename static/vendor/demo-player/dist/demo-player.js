'use strict';

;
(function ($) {

    var ClipPlayer = function () {

    };

    var states = {
        $container: null,
        playList: [],
        vcurr: null,
        vnext: null,
        $vcurr: null,
        $vnext: null
    };

    var methods = {
        processPlayListHash: function (playList, duration) {
            var hash = {};
            var second;

            playList.map(function (clip, index) {
                hash[parseInt(clip)] = {clip: clip, index: index, second: second, timeId: parseInt(clip)};
                second += duration;
            });
            return hash;
        },
        trySetDurationOfLastClip: function(duration, clipIndex) {
            if (!states.lastDurationSet && clipIndex == states.playList.length - 1) {
                var opts = this.opts;

                states.lastDuration = duration;
                states.lastDurationSet = true;
                states.total = states.total - opts.duration + duration;
            }
        },
        resolveTimeId: function (timeId) {
            var opts = this.opts;
            var states = this.states;

            var idIndex = 0;
            states.playList.some(function (clip) {
                var clipSecond = parseInt(clip);
                if (clipSecond > timeId) {
                    return true;
                } else {
                    idIndex = clipSecond
                }
            });

            return {
                idIndex: idIndex,
                second: timeId - idIndex
            }
        },
        timeIdToSecond: function (timeId) {
            var opts = this.opts;
            var states = this.states;
            var timeIdObject = this.resolveTimeId(timeId);
            var clip = states.playHash[timeIdObject.idIndex];

            return clip ? clip.index * opts.duration + timeIdObject.second : -1;
        },
        secondToTimeId: function (second) {
            var opts = this.opts;
            var states = this.states;
            var baseIndex = Math.floor(second / opts.duration);
            var clip = states.playList[baseIndex];

            return clip ? parseInt(clip) + second % opts.duration : -1;
        },
        getClipByIndex: function (index) {
            var timeId = parseInt(this.states.playList[index]);
            if (isNaN(timeId)) return;
            return this.states.playHash[this.resolveTimeId(timeId).idIndex];
        },
        videoUrl: function (file, base) {
            return this.opts.baseUrl + file;
        },
        resetToNulls: function (object, keys) {
            keys.map(function (key) {
                object[key] = null;
            });
        }
    };

    var defaultOpts = {
        duration: 5,
        baseUrl: ''
    };

    ClipPlayer.prototype = {
        init: function ($container, opts) {
            opts = opts || {};
            opts.duration = opts.duration || defaultOpts.duration;
            opts.baseUrl = opts.duration || defaultOpts.baseUrl;
            methods.opts = this.opts = opts;
            methods.states = states;

            states.$container = $container;

            $container.html(
                '<div class="demo-player">' +
                '<video class="one"><source type="video/mp4"></video>' +
                '<video class="two"><source type="video/mp4"></video>' +
                '<div class="controls">' +
                '   <div class="current-time"></div>' +
                '   <div class="progress-bar-wrapper">' +
                '       <div class="bar"></div>' +
                '       <div class="played"></div>' +
                '       <div class="handle"></div>' +
                '   </div>' +
                '   <div class="speed"></div>' +
                '</div>' +
                '</div>'
            );

            states.$handle = this.$('.handle');
            states.$played = this.$('.played');
            states.$bar = this.$('.bar');
            states.$progress = this.$('.progress-bar-wrapper');

            states.$vcurr = this.$('.one');
            states.$vnext = this.$('.two');
            states.vcurr = states.$vcurr[0];
            states.vnext = states.$vnext[0];

            states.$videos = this.$('video');
            this.initVideoEvents(states.vcurr);
            this.initVideoEvents(states.vnext);
            this.initElemEvents();
            return this;
        },
        $: function (selector) {
            return states.$container.find(selector);
        },
        initElemEvents: function () {
            var self = this;

            states.$progress.on('mousedown', function (e) {
                var vcurr = states.vcurr;
                var isPaused = vcurr.paused;
                var $target = $(e.target);
                var offsetX = e.offsetX;
                if ($target.hasClass('handle')) {
                    offsetX += $target.position().left - 8;
                    //console.log($target.position().left);
                }

                self.playAtTime(offsetX / states.$progress.width() * states.total, isPaused);
            });

            $(document).on('keydown', function (e) {
                if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 32) {
                    if ($('input:focus, textarea:focus').length) {
                        return;
                    }
                }
                var vcurr = states.vcurr;
                if (e.keyCode == 37 || e.keyCode == 39) {

                    var isPaused = vcurr.paused;

                    var timeId = vcurr.timeId || methods.secondToTimeId(0);
                    var timeIdObject = methods.resolveTimeId(timeId);
                    var clip = states.playHash[timeIdObject.idIndex];
                    if (!clip) return;
                    if (e.keyCode == 39) {
                        var nextClip = methods.getClipByIndex(clip.index + 1)
                    } else if (e.keyCode == 37) {
                        nextClip = methods.getClipByIndex(clip.index - 1);
                    }

                    if (nextClip) {
                        self.playAtTimeId(nextClip.timeId, false, isPaused);
                    } else {
                        self.pause();
                    }
                } else if (e.keyCode == 32) {
                    vcurr.paused ? self.play() : self.pause();
                }
            });
        },
        initVideoEvents: function (video) {
            var self = this;
            video.addEventListener('loadeddata', function () {
                methods.trySetDurationOfLastClip(video.duration, video.clipIndex);
                video.playSecondOnLoaded && video.playSecondOnLoaded();
            });

            video.addEventListener('ended', function () {
                video.onEnded && video.onEnded();
            });

            video.addEventListener('timeupdate', function () {
                //console.log(video.timeId,
                //    second,
                //    states.total
                //);

                self.setPercentage(video.timeId + video.currentTime)
            });
        },
        setPercentage: function (timeId) {
            var opts = this.opts;
            var second = methods.timeIdToSecond(timeId);
            var percentage = second >= 0 ? (second / states.total) * 100 + '%' : '100%';
            states.$handle.css('left', percentage);
            states.$played.css('width', percentage);
        },
        setPlayList: function (playList, baseUrl) {
            var opts = this.opts;
            states.playList = playList;
            states.playHash = methods.processPlayListHash(playList);
            states.total = playList.length * this.opts.duration;
            opts.baseUrl = baseUrl || opts.baseUrl;

            return this;
        },
        resetVideoCallback: function () {
            var vcurr = states.vcurr, vnext = states.vnext;
            var callbackKeys = ['playSecondOnLoaded', 'onEnded'];
            methods.resetToNulls(vcurr, callbackKeys);
            methods.resetToNulls(vnext, callbackKeys);
        },
        playAtTimeId: function (timeId, skipSetCurr, skipPlay) {
            timeId = timeId || parseInt(states.playList[0]);
            var self = this;
            var timeIdObject = methods.resolveTimeId(timeId);
            var clip = states.playHash[timeIdObject.idIndex];
            if (!clip) return;
            var nextClip = methods.getClipByIndex(clip.index + 1);

            // 同步播放的进度条
            self.setPercentage(timeId);

            var vcurr = states.vcurr;
            this.resetVideoCallback();
            if (skipSetCurr) {
                vcurr.play();
            } else {
                vcurr.src = methods.videoUrl(clip.clip);
                vcurr.timeId = clip.timeId;
                vcurr.clipIndex = clip.index;

                if (timeIdObject.second) {
                    vcurr.load();
                    vcurr.playSecondOnLoaded = function () {
                        vcurr.currentTime = timeIdObject.second;
                        if (!skipPlay) {
                            console.log('skip play ? ', vcurr.currentTime, skipPlay);
                            vcurr.play();
                        }
                        vcurr.playSecondOnLoaded = null;
                    };
                } else {
                    if (!skipPlay) vcurr.play();
                }
            }

            vcurr.onEnded = function () {
                if (nextClip) {
                    self.swapVideos();
                    self.playAtTimeId(parseInt(nextClip.clip), true);
                }
            };

            states.$videos.removeClass('current');
            states.$vcurr.addClass('current');

            if (!nextClip) return;
            var vnext = states.vnext;
            vnext.src = methods.videoUrl(nextClip.clip);
            vnext.timeId = nextClip.timeId;
            vnext.clipIndex = nextClip.index;
            vnext.load();

            return this;
        },
        playAtTime: function (time, skipPlay) {
            if ((time + '').indexOf(':') != -1) {
                // need to process time text
            } else {
                var second = time;
            }
            this.playAtTimeId(methods.secondToTimeId(second), false, skipPlay);
        },
        swapVideos: function () {
            var tmp = states.vcurr;
            states.vcurr = states.vnext;
            states.vnext = tmp;

            states.$vcurr = $(states.vcurr);
            states.$vnext = $(states.vnext);
        },
        on: function (eventName, callback) {
            return this;
        },
        off: function (eventName) {
            return this;
        },
        play: function () {
            var vcurr = states.vcurr;
            if (!vcurr.src) {
                this.playAtTimeId();
            } else {
                states.vcurr.play();
            }
            return this;
        },
        pause: function () {
            states.vcurr.pause();
            return this;
        }
    };

    window.ClipPlayer = ClipPlayer;
})(jQuery);
