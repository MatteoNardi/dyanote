'use strict';

describe('Controller: NotesCtrl', function () {

  // load the controller's module
  beforeEach(module('dyanote'));

  var NotesCtrl,
    scope,
    notes,
    $q,
    $rootScope,
    $location,
    deferred; // sotes.loadAll deferred promise

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, _$rootScope_, _notes_, _$q_, _$location_) {
    $q = _$q_
    $rootScope = _$rootScope_;
    $location = _$location_;
    notes = _notes_;
    scope = $rootScope.$new();

    deferred = $q.defer();
    spyOn(notes, 'loadAll').andReturn(deferred.promise);

    spyOn(notes, 'getRoot').andReturn({'title': 'Root note'});
    deferred.resolve();

    NotesCtrl = $controller('NotesCtrl', {
      $scope: scope
    });
  }));

  it('should start with the root note opened', function () {
    $rootScope.$apply();
    expect(scope.notes[0].title).toEqual('Root note');
  });

  it('should open new note on location change', function () {
    var openedNote = {};
    $location.hash('20');
    spyOn(notes, 'getById').andReturn(openedNote);
    $rootScope.$apply();
    expect(scope.notes[1]).toBe(openedNote);
  });
});
