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
    deferred, // sotes.loadAll deferred promise
    rootNote;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, _$rootScope_, _notes_, _$q_, _$location_) {
    $q = _$q_
    $rootScope = _$rootScope_;
    $location = _$location_;
    notes = _notes_;
    scope = $rootScope.$new();

    rootNote = { title: "Root note", id: 3};
    deferred = $q.defer();
    spyOn(notes, 'loadAll').andReturn(deferred.promise);

    spyOn(notes, 'getRoot').andReturn(rootNote);
    deferred.resolve();

    NotesCtrl = $controller('NotesCtrl', {
      $scope: scope
    });
    $rootScope.$apply();
  }));

  it('should start with the root note opened', function () {
    expect(scope.notes[0]).toEqual(rootNote);
  });

  it('should open new note on $openNote signal', function () {
    var openedNote = { id: 10 };
    spyOn(notes, 'getById').andCallFake(function(id) {
      return id == rootNote.id ? rootNote :
             id == openedNote.id ? openedNote :
             null;
    });
    scope.$emit('$openNote', rootNote.id, openedNote.id);
    $rootScope.$apply();
    expect(scope.notes).toEqual([rootNote, openedNote]);
  });

  it('should close unwanted notes on $openNote signal', function () {
    var unwantedNote = { id: 17 };
    var openedNote = { id: 10 };
    scope.notes = [rootNote, unwantedNote];
    spyOn(notes, 'getById').andCallFake(function(id) {
      return id == rootNote.id ? rootNote :
             id == openedNote.id ? openedNote :
             id == unwantedNote.id ? unwantedNote :
             null;
    });
    scope.$emit('$openNote', rootNote.id, openedNote.id);
    $rootScope.$apply();
    expect(scope.notes).toEqual([rootNote, openedNote]);
  });
});
