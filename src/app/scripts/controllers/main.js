'use strict';

/**
 * @ngdoc function
 * @name readerStandAloneApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the readerStandAloneApp
 */
angular.module('readerStandAloneApp')
  .controller('MainCtrl', function ($scope, $routeParams) {
    var urlregex = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
    if ($routeParams.url) {
        var url = $routeParams.url;
        if (url.match(urlregex)) {
            if ($routeParams.audio == 1) {
                $scope.audio = true;
            }
            $scope.bookURL = $routeParams.url;  
        }
    }
  
  });
