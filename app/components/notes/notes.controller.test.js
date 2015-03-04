'use strict';

describe('Controller: NotesController', function () {

  // load the controller's module
  beforeEach(module('dyanote'));

  var NotesController,
    scope,
    notesGraph,
    openNotes,
    $q,
    $rootScope,
    $location,
    rootNote;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, _$rootScope_, _openNotes_, _notesGraph_, _$q_, _$location_) {
    $q = _$q_
    $rootScope = _$rootScope_;
    $location = _$location_;
    openNotes = _openNotes_;
    notesGraph = _notesGraph_;
    $rootScope.app = {};
    scope = $rootScope.$new();

    rootNote = {
      title: "Root note",
      id: 3,
      hasParent: function () { 
        return false; 
      }
    };
    openNotes.open(rootNote);

    spyOn(notesGraph, 'getRoot').and.returnValue(rootNote);
    spyOn(notesGraph, 'count').and.returnValue(1);

    NotesController = $controller('NotesController', {
      $scope: scope
    });
    $rootScope.$apply();
  }));

  it('should open new note on openNote signal', function () {
    var openedNote = { id: 10 };
    spyOn(notesGraph, 'getById').and.callFake(function(id) {
      return id == rootNote.id ? rootNote :
             id == openedNote.id ? openedNote :
             null;
    });
    scope.$emit('openNote', rootNote.id, openedNote.id);
    $rootScope.$apply();
    expect(scope.notes).toEqual([rootNote, openedNote]);
  });

  it('should close unwanted notes on openNote signal', function () {
    var unwantedNote = { id: 17 };
    var openedNote = { id: 10 };
    openNotes.notes.push(unwantedNote);
    spyOn(notesGraph, 'getById').and.callFake(function(id) {
      return id == rootNote.id ? rootNote :
             id == openedNote.id ? openedNote :
             id == unwantedNote.id ? unwantedNote :
             null;
    });
    scope.$emit('openNote', rootNote.id, openedNote.id);
    $rootScope.$apply();
    expect(scope.notes).toEqual([rootNote, openedNote]);
  });
});
