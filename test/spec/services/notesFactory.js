'use strict';

describe('Service: notesFactory', function () {
  beforeEach(module('dyanote'));

  var notesFactory,
    notesGraph,
    rootJson, rootNote,
    archiveJson, archiveNote,
    n2Json, note2;

  beforeEach(inject(function (_notesFactory_, _notesGraph_, SERVER_CONFIG) {
    notesFactory = _notesFactory_;
    notesGraph = _notesGraph_;

    var authorUrl = SERVER_CONFIG.apiUrl + 'users/user@example.com/';
    rootJson = {
      url: authorUrl + 'pages/0/',
      id: 0,
      parent: '',
      created: '2013-12-24T17:41:10.871Z',
      flags: ['root'],
      title: 'Root',
      body: 'This is the root note',
      author: authorUrl
    };
    rootNote = notesFactory.newNote(rootJson);

    archiveJson = {
      url: authorUrl + 'pages/1/',
      id: 1,
      parent: '',
      created: '2013-12-24T17:41:10.871Z',
      flags: ['archive'],
      title: 'Archive',
      body: 'This is the archive',
      author: authorUrl
    };
    archiveNote = notesFactory.newNote(archiveJson);

    n2Json = {
      url: authorUrl + 'pages/2/',
      id: 2,
      parent: rootJson.url,
      created: '2013-12-27T17:41:10.871Z',
      flags: [],
      title: 'Note 2',
      body: 'This is note N.2',
      author: authorUrl
    };
    note2 = notesFactory.newNote(n2Json);
  }));

  it('should move notes', function () {
    expect(note2.parent).toBe(rootNote);
    note2.parent = archiveNote;

    expect(note2.parent).toEqual(archiveNote);
  });

  it('should archive notes', function () {
    expect(note2.parent).toBe(rootNote);
    note2.archive();
    expect(note2.parent).toEqual(archiveNote);
  });

  it('should convert note from the server format', function () {
    expect(note2.title).toEqual(n2Json.title);
    expect(note2.body).toEqual(n2Json.body);
    expect(note2.id).toEqual(n2Json.id);
    expect(note2.url).toEqual(n2Json.url);
    expect(note2.isRoot()).toBe(false);
    expect(note2.isArchive()).toBe(false);
    expect(note2.parent).toBe(rootNote);
  });

  it('should throw when asking for parent of root or archive note', function () {
    expect(rootNote.isRoot()).toBe(true);
    expect(rootNote.isArchive()).toBe(false);
    expect(function () { rootNote.parent; }).toThrow("Root note has no parent");

    expect(archiveNote.isRoot()).toBe(false);
    expect(archiveNote.isArchive()).toBe(true);
    expect(function () { archiveNote.parent; }).toThrow("Archive note has no parent"); 
  });

  it('should fire signal when title changes', function () {
    var called = false;
    note2.titleChangedSignal.addHandler(function () {
      called = true;
    });
    note2.title = "New title for note 2";
    expect(called).toBe(true);
  });
});
