'use strict';
angular
    .module("ui.screen", [])

    .directive("uiFullscreen", function () {

        var isRunningFullscreen = false;
        var tagTrigger = null;

        $(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function () {
            isRunningFullscreen = !isRunningFullscreen;

            console.log("change, isRunning fullscreen = %s", isRunningFullscreen);

            toggleCssClass(tagTrigger, isRunningFullscreen);
            toggleTitle(tagTrigger, isRunningFullscreen);
        });

        var toggleCssClass = function (tag, isRunning) {
            var cssClass = { add: "fa-expand", remove: "fa-compress" };
           

            if (isRunning) {
                cssClass.add = "fa-compress";
                cssClass.remove = "fa-expand";
            }

            $(tag).find(":first-child")
                .addClass(cssClass.add)
                .removeClass(cssClass.remove);
        };

        var toggleTitle = function (tag, isRunning) {
            var $tag = $(tag);
            var title = isRunning ? $tag.attr("ui-fullscreen-title-off") : $tag.attr("ui-fullscreen-title-on");
            $tag.attr("title", title);
        };

        var launch = function (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        };

        var cancel = function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }else if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        };

        // var isEnabled = function () {
        //     return document.fullscreenEnabled ||
        //            document.mozFullScreenEnabled ||
        //            document.webkitFullscreenEnabled;
        // };

        var isRunning = function () {
            return isRunningFullscreen;
        };

        var isSupported = function (element) {
            return element.requestFullscreen ||
                   element.mozRequestFullScreen ||
                   element.webkitRequestFullscreen ||
                   element.msRequestFullscreen;
        };

        window.toggleFullscreen = function (tag) {
            tagTrigger = tag;

            if (isRunning()) {
                console.log("exit fullscreen");
                cancel();
            }
            else {
                console.log("start fullscreen");
                launch(document.documentElement);
            }

        };

        return {
            restrict: 'A',
            link: function ($scope, $element) {

                if (isSupported(document.documentElement)) {
                    $element.on("click", function () {
                        window.toggleFullscreen(this);
                    });
                } else {
                    console.error("Current browser not support requestFullscreen api.");
                    $element.hide();
                }
            }
        };
    });