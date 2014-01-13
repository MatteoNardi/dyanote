'use strict';

describe('Controller: NotesCtrl', function () {

  // load the controller's module
  beforeEach(module('dyanote'));

  var NotesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NotesCtrl = $controller('NotesCtrl', {
      $scope: scope
    });
  }));

});
