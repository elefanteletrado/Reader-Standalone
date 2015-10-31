'use strict';

angular.module('readerStandAloneApp')
  .directive('epubviewer', function () {
  return {
    restrict: 'E',
    scope: {
      src: '@',
      cfi: '@',
      page: '@',
      fixedlayout: '=',
      scale: '=?', // true or false
      calcSubtractHeight: '&', // function to calculate height of everything that is not the reader area (e.g. header, footer, padding)
      onChapterDisplayed: '&',
      onPageChanged: '&',
      onReady: '&',
      onRendered: '&'
    },
    templateUrl: 'views/templates/viewer.html',

    controller: function ($scope, $rootScope) {

      $scope.isReady = false;
      $scope.loading = true;

      var epubSettings = {
        fixedLayout: $scope.fixedlayout
      };

      var book = $scope.book = $rootScope.book = ePub(epubSettings);

      $scope.nextLocAvailable = function () {
          if ($scope.isReady) {

              var isLastChapter = parseInt($scope.book.spinePos + 1) === parseInt($scope.book.spine.length);

              // if is last page of chapter. isNaN is because EPUB JS returns NaN for fixed layout
              var isLastPage = (parseInt($scope.book.renderer.chapterPos) === parseInt($scope.book.renderer.displayedPages)) ||
                isNaN($scope.book.renderer.displayedPages);
                $scope.book.nextLocAvailable = !isLastChapter && isLastPage;
              return $scope.book.nextLocAvailable;
          }
      };

      $scope.nextPage = function () {
          if ($scope.isReady && $scope.nextLocAvailable()) {
              $scope.isReady = false;
              $scope.book.nextPage().then(function () {
                  $scope.isReady = true;
                  $scope.$apply();
              });
          }
      };

      $scope.prevPage = function () {
          if ($scope.isReady && $scope.book.spinePos !== 0) {
              $scope.isReady = false;
              $scope.book.prevPage().then(function () {
                  $scope.isReady = true;
                  $scope.$apply();
              });
          }
      };


      book.ready.all.then(function () {
        $scope.isReady = true;
        $scope.$apply();
        $scope.onReady({
          book: book
        });
      });

      $scope.applyRendererCallbacks = function () {
          book.on('renderer:chapterDisplayed', function (e) {
              // heartbeat.start();
              $scope.onChapterDisplayed({
                  e: e
              });
          });

          book.on('renderer:pageChanged', function (e) {
              $scope.onPageChanged({
                  e: e
              });
          });
      };
     

      this.arrowKeys = function (e) {

        if (e.keyCode === 37) {
          $scope.prevPage();
          $scope.$apply();
          return false;
        }
        if (e.keyCode === 39) {
          $scope.nextPage();
          $scope.$apply();
          return false;
        }
      };

      document.addEventListener('keydown', this.arrowKeys.bind(this), false);


    },

    link: function (scope, element, attrs) {

        var book = scope.book;
        attrs.$observe('src', function () {

            //TODO: destroy previous

            element.hide();

            var renderToElemSelector = '#area';

            var $area = element.find(renderToElemSelector)[0];

            book.open(attrs.src).then(function () {
                scope.loading = false;

                var shouldScale = scope.$eval(attrs.scale) === true ? true : false;

                if (shouldScale) {

                        var isBookPortrait = false;
                        if (book.metadata.orientation === 'portrait') {
                            isBookPortrait = true;
                            angular.element($area).addClass('portrait');
                        }



                        var resizeRefresh = function () {

                            var scaleSubtractHeight = 0;

                            if (typeof scope.calcSubtractHeight === 'function') {
                                scaleSubtractHeight = scope.calcSubtractHeight();
                            }
                            
                            
                            var clientWidth =  document.body.clientWidth;
                            var clientHeight =  document.body.clientHeight - scaleSubtractHeight;

                            var sizeFactors = {
                              'x': {
                                'client': clientWidth,
                                'area': $area.offsetWidth
                              },
                              'y': {
                                'client': clientHeight,
                                'area': $area.offsetHeight
                              }
                            };

                            var factor = 'y';
                            
                            // consider full window size without height subtract
                            if (clientHeight + scaleSubtractHeight >= clientWidth && !isBookPortrait) {
                              factor = 'x';
                            } 
                           
                            var scaleValue = (sizeFactors[factor].client - sizeFactors[factor].area) / sizeFactors[factor].area;
                           
                            if (scaleValue < 0) {
                              scaleValue = 1 - Math.abs(scaleValue);
                            } else {
                              scaleValue = 1 + Math.abs(scaleValue);
                            }
                        
                            var scaleCssValue = 'scale(' + scaleValue + ')';
                            var scaleOrigin = '50% 0';

                            // CSS: transform: scale(x);
                            $area.style.msTransform = scaleCssValue;
                            $area.style.oTransform = scaleCssValue;
                            $area.style.webkitTransform = scaleCssValue;
                            $area.style.transform = scaleCssValue;

                            // CSS: transform-origin: x;
                            $area.style.msTransformOrigin = scaleOrigin;
                            $area.style.oTransformOrigin = scaleOrigin;
                            $area.style.webkitTransformOrigin = scaleOrigin;
                            $area.style.transformOrigin = scaleOrigin;
                            
                            // this will center container vertically
                            $area.style.marginTop = - ($area.offsetHeight * scaleValue) / 2  + 'px';

                        };

                        // refresh on resize
                        var resizeTimeout;
                        angular.element(window).on('resize', function (){
                            clearTimeout(resizeTimeout);
                            resizeTimeout = window.setTimeout(resizeRefresh, 100);
                        }).trigger('resize');
                        // refresh on full-screen
                        angular.element(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function () {
                            clearTimeout(resizeTimeout);
                            resizeTimeout = window.setTimeout(resizeRefresh, 100);
                        });
                        
                }

     
                if (attrs.cfi.length === 0) {
                    scope.applyRendererCallbacks();
                }

                var rendered = book.renderTo($area);

                rendered.then(function () {
                    if (attrs.cfi.length > 1) {
                        scope.applyRendererCallbacks();
                        book.displayChapter(attrs.cfi).then(function () {
                            if (attrs.page.length > 0) {
                                book.render.page(attrs.page);
                            }
                        });
                    }
                });
            });

            element.show();
      
      });

    }

  };
});