'use strict';

describe('Controller: LogoutController', function () {

  // load the controller's module
  beforeEach(module('dyanote'));

  var LogoutController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LogoutController = $controller('LogoutController', {
      $scope: scope
    });
  }));

});
