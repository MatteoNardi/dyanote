'use strict';

describe('Service: notesGraph', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var notesGraph,
    rootNote,
    archiveNote;

  beforeEach(inject(function (_notesGraph_) {
    notesGraph = _notesGraph_;

    rootNote = {
      id: 0,
      isArchive: function () { return false; },
      isRoot: function () { return true; },
      hasTemporaryId: function () { return false; },
    };
    archiveNote = {
      id: 1,
      isArchive: function () { return true; },
      isRoot: function () { return false; },
      hasTemporaryId: function () { return false; },
    };
  }));

  it('should allow to get notes by id', function () {
    notesGraph.add(rootNote);
    notesGraph.add(archiveNote);

    expect(notesGraph.getById(rootNote.id)).toBe(rootNote);
    expect(notesGraph.getById(archiveNote.id)).toBe(archiveNote);
    expect(function () { notesGraph.getById(42); }).toThrow('Note 42 not found.');
  });

  it('should allow to get root note', function () {
    notesGraph.add(rootNote);
    notesGraph.add(archiveNote);

    expect(notesGraph.getRoot()).toBe(rootNote);
  });

  it('should allow to get archive note', function () {
    notesGraph.add(rootNote);
    notesGraph.add(archiveNote);

    expect(notesGraph.getArchive()).toBe(archiveNote);
  });

  it('should count notes', function () {
    notesGraph.add(rootNote);
    notesGraph.add(archiveNote);

    expect(notesGraph.count()).toEqual(2);
  });

  it('should search for notes', inject(function ($timeout, $rootScope) {
    rootNote.title = 'Root Note';
    rootNote.body = '...Root note body';
    notesGraph.add(rootNote);

    archiveNote.title = 'Rabbit archive';
    archiveNote.body = 'archive body';
    notesGraph.add(archiveNote);

    var note3 = {
      id: 2,
      title: 'Note 3',
      body: 'Where is the white rabbit?',
      isArchive: function () { return false; },
      isRoot: function () { return false; },
      hasTemporaryId: function () { return false; }
    };
    notesGraph.add(note3);

    var response = notesGraph.search('rabbit');
    var ris = [];
    response.promise.then(function () {
      ris = response.results;
    });
    for (var i = 0; i < 10; i++) {
      try {
        $timeout.flush();
      } catch (e) {}
      $rootScope.$apply();
    }

    expect(ris).toEqual([archiveNote, note3]);
  }));
});
