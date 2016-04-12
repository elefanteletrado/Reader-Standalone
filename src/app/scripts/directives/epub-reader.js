'use strict';


angular.module('readerStandAloneApp')
  .directive('epubreader', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            src: '@',
            audio: '=',
            cfi: '='
        },
        templateUrl: 'views/templates/reader.html',
        controller: function ($scope) {

            $scope.currentPage = 0;
            $scope.totalPages = 0;
            $scope.locationPercent = 0;
            $scope.currentLocation = {
                percent: 0,
                number: 0
            };

            $scope.prePaginated = false;

            $scope['fontSize'] = {
                'current': 24,
                'max': 30,
                'min': 18
            };

            $scope.totalLocations = 0;
        
            $scope.themes = [{ id: 'default' },{id: 'night'},{id: 'green'},{id: 'pink'},{id: 'brown'}, {id: 'yellow'}];

            // this will go as the value to the calcSubtractHeight attribute of epub-viewer
            $scope.calcSubtractHeight = function () {
                var header = angular.element('.el-reader-header');
                var footer = angular.element('.el-reader-footer');
                var headerHeight = 0;
                var footerHeight = 0;

                if (header !== null && header.prop('offsetHeight') > 0) {
                    headerHeight = header.outerHeight(true);
                }

                if (footer !== null && footer.prop('offsetHeight') > 0) {
                    footerHeight = footer.outerHeight(true);
                }
                
                return headerHeight + footerHeight;
            };

            $scope.currentTheme = $scope.themes[0];

            $scope.setTheme = function (theme) {
                $scope.showColorOptions = false;
                $scope.currentTheme = theme;
            };

            // Media Overlay 
            $scope.mo = {
                volume: 50,
                player: null,
                isPlaying: false,
                isPaused: false,
                audioRequired: false
            };

            $scope.changeFontSize = function (increment) {
                var fontSize = $scope['fontSize']['current'] + increment;
                if (fontSize >= $scope['fontSize']['min'] && fontSize <= $scope['fontSize']['max']) {
                    $scope['fontSize']['current'] = fontSize;
                }
            };

            $scope.changeVolume = function (number) {
                var volume = $scope.mo.volume + number;
                if (volume >= 0 && volume <= 100) {
                    $scope.mo.volume += number;
                }
            };

            $scope.$watch('mo.volume', function () {
                if ($scope.mo.player !== null) {
                    $scope.setMOPlayerVolume();
                }
            });

            $scope.setMOPlayerVolume = function () {
                var volume = $scope.mo.volume / 100;
                $scope.mo.player.setVolume(volume);
            };

            $scope.playMO = function () {
                $scope.setMOPlayerVolume();
                // isPlaying means there's fetched something to resume playing
                if ($scope.mo.isPlaying === true) {
                    $scope.mo.player.resume();
                } else {
                    $scope.mo.player.startPlayback();
                }
                $scope.mo.isPlaying = true; // $scope.mo.player.get('is_playing');
                $scope.mo.isPaused = false;

            };

            // user paused audio
            $scope.pauseMO = function () {
                if ($scope.mo.isPlaying === true) {
                    $scope.mo.player.pause();
                    $scope.mo.isPaused = true;
                }
            };

            $scope.resetMO = function () {
                if ($scope.mo.player !== null) {
                    $scope.mo.player.destroyClip();
                }
                $scope.mo.isPlaying = false;
                $scope.mo.player = null;
            };

            $scope.gotoFirstPage = function () {
               $scope.book.displayChapter(0).then(function () {
               });
            };

            $scope.setPageNumber = function () {
                if (typeof $scope.book !== 'undefined') {
                    if ($scope.prePaginated) {
                        $scope.currentPage = $scope.book.currentChapter.spinePos;
                        $scope.totalPages = $scope.book.spine.length - 1;
                    } else {
                        var percentageFromCfi = $scope.book.locations.percentageFromCfi($scope.book.getCurrentLocationCfi());
                        $scope.currentLocation.percent = Math.round(percentageFromCfi * 100);
                        $scope.currentLocation.number = $scope.book.locations.locationFromCfi($scope.book.getCurrentLocationCfi())
                        $scope.totalLocations = $scope.book.locations.total;
                    }
                }
            };

            $scope.afterReady = function (book) {
                $scope.book = book;
                $scope.bookTitle = $scope.book.metadata.bookTitle;
                $scope.toc = $scope.book.toc;
                if ($scope.book.globalLayoutProperties.layout === 'pre-paginated') {
                    $scope.prePaginated = true;
                }
            };

            $scope.showTOC = function () {
                $scope.shouldShowTOC = true;
            };

            $scope.hideTOC = function () {
                $scope.shouldShowTOC = false;
            };

            $scope.gotoTOCItem = function (item) {
                $scope.book.gotoCfi(item.cfi);
            };

            $scope.afterPageChanged = function (locationCfi) {
                $timeout(function () {
                    $scope.setPageNumber();
                });
            };
           
            $scope.afterChapterDisplayed = function () {
                if (typeof $scope.book !== 'undefined') {
                    if ($scope.audio) {
                       var chapterHasAudio = $scope.book.currentChapter.mediaOverlay !== '';
                        // stop any media overlay that might be playing
                        $scope.resetMO();
                                        
                        //Note: Play Media Overlay
                        if (chapterHasAudio) {

                            //Note:use the media overlay model
                            var moObject = new MediaOverlay({
                                'smil_url': $scope.book.currentChapter.mediaOverlayURI
                            });

                            var highlighterContent = $scope.book.renderer.doc;
                            
                            var highlighterSettings = {
                                model: moObject,
                                el: highlighterContent
                            };

                            var highlighterActiveClass = $scope.book.metadata.media_overlay_active_class;
                            if (highlighterActiveClass !== undefined && highlighterActiveClass !== '') {
                                highlighterSettings.activeClass = highlighterActiveClass;
                            }

                            new MOHighlighter(highlighterSettings);
                            $scope.mo.player = moObject;

                          
                            if ($scope.mo.isPaused === false) {
                                $scope.mo.player.fetch({
                                    success: function () {
                                        $timeout(function () { $scope.playMO(); });
                                    }
                                });
                            } else {
                                $scope.mo.player.fetch();
                            }

                            var nextChapter = $scope.book.spine[$scope.book.currentChapter.spinePos + 1];

                            if (nextChapter !== undefined) {
                                $scope.mo.player.bind('change:is_document_done', function () {
                                    $timeout(function () {
                                        $scope.book.nextPage();
                                    }, 1 * 1000);
                                });
                            }
                        }

                    }
                 
                }
                
            };


        },

        link: function () {

        }

    };
}]);