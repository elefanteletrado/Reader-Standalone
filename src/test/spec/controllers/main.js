'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('readerStandAloneApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      $routeParams: {url: 'https://dl.dropboxusercontent.com/s/xhzqtafx0wrmd1v/Letra_D.epub?dl=1'}
      // place here mocked dependencies
    });
  }));

  it('should have valid URL', function () {
    expect(scope.bookURL).toBeDefined();
  });
});
