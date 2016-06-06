'use strict';

angular.module('readerStandAloneApp')
  .directive('epubviewer', ['$document', '$timeout', '$window', function ($document, $timeout, $window) {
  return {
    restrict: 'E',
    scope: {
      src: '@',
      cfi: '@',
      fontSize: '@',
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
      $scope.shouldAllowPrev = false;
      $scope.shouldAllowNext = false;
      $scope.layout = '';
      
      var epubSettings = {
        gap: 40,
        goto: $scope.cfi || false,
        styles: {
          'font-size': $scope['fontSize'] + 'px' || 'medium'
        }
      };

      $scope.$watch('fontSize', function (newValue, oldValue) {
        if ($scope.layout !== 'pre-paginated') {
          $scope.book.setStyle('font-size', newValue + 'px');
        }
      });

      var book = $scope.book = $rootScope.book = ePub(epubSettings);

      $scope.updateNavigation = function () {
        if ($scope.layout === 'pre-paginated') {
          $scope.shouldAllowNext = parseInt($scope.book.currentChapter.spinePos + 1) < parseInt($scope.book.spine.length);
          $scope.shouldAllowPrev = $scope.book.currentChapter.spinePos > 0;
        } else {
          var percentageFromCfi = book.locations.percentageFromCfi(book.getCurrentLocationCfi());
          var relativePage = Math.floor(percentageFromCfi * $scope.book.locations.total);
          $scope.shouldAllowNext = relativePage < $scope.book.locations.total;
          $scope.shouldAllowPrev = relativePage > 2; // 1 is always the cover
        }
      } 
      
      $scope.nextPage = function () {
          if ($scope.isReady && $scope.shouldAllowNext) {
              $scope.isReady = false;
              $scope.book.nextPage();
          }
      };

      $scope.prevPage = function () {
          if ($scope.isReady && $scope.shouldAllowPrev) {
              $scope.isReady = false;
              $scope.book.prevPage();
          }
      };
      

      $scope.applyRendererCallbacks = function () {
        book.on('book:ready', function (e) {
          $scope.$apply();
          $scope.layout = book.globalLayoutProperties.layout;
          $timeout(function () {
            $scope.onReady({
              book: book
            });
          });

          book.locations.generate().then(function(locations) {
            $timeout(function () {             
              $scope.updateNavigation();
              $scope.isReady = true;
            });
          });
        });
        
        book.on('renderer:chapterDisplayed', function (e) {
          $timeout(function () {
            $scope.onChapterDisplayed({
              e: e
            });
          });
        });

        book.on('renderer:locationChanged', function(locationCfi){

          $timeout(function () {
            $scope.onPageChanged({
              locationCfi: locationCfi
            });
          });

          $timeout(function () {
            $scope.isReady = true;
            $scope.updateNavigation();
          });            
        });
      };

    },

    link: function (scope, element, attrs) {

        var book = scope.book;

        attrs.$observe('src', function () {
            //TODO: destroy previous
            var renderToElemSelector = '#area';
            var $area = element.find(renderToElemSelector)[0];

            book.open(attrs.src).then(function () {
                scope.loading = false;

                
                scope.applyRendererCallbacks();
                

                var rendered = book.renderTo($area);

                rendered.then(function () {  

                  $area.style.width = book.renderer.formated.pageWidth + 'px'; 
		  $area.style.height = book.renderer.formated.pageHeight + 'px';

                  if (scope.layout !== 'pre-paginated') {
                    $area.style.boxSizing = 'border-box';
                    $area.style.padding = '20px';
                    book.setStyle('font-family', 'Georgia, Times, Times New Roman, serif');
                  } 
                
                  var resizeRefresh = function () {
                    var scaleSubtractHeight = 0;
                    if (typeof scope.calcSubtractHeight === 'function') {
                        scaleSubtractHeight = scope.calcSubtractHeight();
                    }
                    
		    var maxWidth =  document.body.clientWidth;
                    var maxHeight =  document.body.clientHeight - scaleSubtractHeight;
                    var scale = Math.min(maxWidth / $area.offsetWidth, maxHeight / $area.offsetHeight);
                
                    var scaleCss = 'scale(' + scale + ')';
                    var scaleOrigin = '50% 0';

                    // CSS: transform: scale(x);
                    $area.style.transform = scaleCss;

                    // CSS: transform-origin: x;
                    $area.style.transformOrigin = scaleOrigin;

                    // center container
                    $area.style.marginTop = - ($area.offsetHeight * scale) / 2  + 'px';
                    $area.style['margin-left'] = -(book.renderer.formated.pageWidth / 2) + 'px';

                };

                // refresh on resize
                var resizeTimeout;
                angular.element($window).on('resize', function (){
                    $timeout.cancel(resizeTimeout);
                    resizeTimeout = $timeout(resizeRefresh, 100);
                }).trigger('resize');                        

                $document.bind('keydown', function (e){
                  if (e.keyCode === 37) {
                    scope.prevPage();
                    return false;
                  }
                  if (e.keyCode === 39) {
                    scope.nextPage();
                    return false;
                  }
                });
              });
          });
      });

    }

  };
}]);
