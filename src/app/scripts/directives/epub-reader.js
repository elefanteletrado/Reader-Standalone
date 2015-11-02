'use strict';


angular.module('readerStandAloneApp')
  .directive('epubreader', ['$interval', function () {
    return {
        restrict: 'E',
        scope: {
            src: '@',
            audio: '=',
            fixedlayout: '='
        },
        templateUrl: 'views/templates/reader.html',
        //Note: Initialising objects
        controller: function ($scope) {

            $scope.currentPage = 0;
            $scope.totalPages = 0;
            $scope.pageRoll = '';

        
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

            $scope.increaseVolume = function (number) {
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
                $scope.$apply();
               });
            };

            $scope.setPageNumber = function () {
                $scope.currentPage = $scope.book.currentChapter.spinePos;
                if ($scope.currentPage > 0 && $scope.currentPage <= $scope.totalPages) {
                    $scope.pageRoll = $scope.currentPage  + '/' + $scope.totalPages;
                }
            };

            $scope.afterReady = function (book) {
                $scope.book = book;
                $scope.totalPages = $scope.book.spine.length - 1;
                $scope.bookTitle = $scope.book.metadata.bookTitle;
            };
           
            $scope.afterChapterDisplayed = function () {
                if ($scope.book !== undefined) {
                    $scope.setPageNumber();
                    
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

                            $scope.$apply();
                          
                            if ($scope.mo.isPaused === false) {
                                $scope.mo.player.fetch({
                                    success: function () {
                                        $scope.playMO();
                                    }
                                });
                            } else {
                                $scope.mo.player.fetch();
                            }

                            var nextSection = $scope.book.spine[$scope.book.spinePos + 1];
                            //Note: There is a next section and it has media overlay
                            if (nextSection !== undefined && $scope.book.nextLocAvailable) {
                                $scope.mo.player.bind('change:is_document_done', function () {
                                    setTimeout(function () {
                                        $scope.book.nextPage();
                                    }, 1 * 1000);
                                });
                            }
                        } else {
                            $scope.$apply();
                        }

                    }
                 
                }
                
            };


        },

        link: function () {

        }

    };
}]);