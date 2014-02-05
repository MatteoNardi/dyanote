'use strict';

describe('Controller: NoteCtrl', function () {

  beforeEach(module('dyanote'));

  var NoteCtrl,
    notes,
    scope,
    $rootScope;

  beforeEach(inject(function ($controller, _$rootScope_, _notes_) {
    notes = _notes_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    NoteCtrl = $controller('NoteCtrl', {
      $scope: scope
    });
  }));

  it('should update a note on body change', function () {
    var note = {
      title: 'Title',
      id: 2343,
      body: '<note>...</note>'
    };
    scope.note = note;
    spyOn(notes, 'uploadById');
    note.body = '<note> Changed </note>';
    $rootScope.$apply();
    expect(notes.uploadById).toHaveBeenCalledWith(note.id);
  });

});
