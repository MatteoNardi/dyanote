'use strict';

xdescribe('Service: notes', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var notes,
    noteResource,
    $rootScope,
    $log,
    $q,
    $timeout,
    rootNote,
    archiveNote,
    note4,
    authorUrl;

  beforeEach(inject(function (_notes_, _$rootScope_, _$log_, _$q_, _$timeout_, SERVER_CONFIG) {
    notes = _notes_;
    noteResource = _noteResource_;

    $log = _$log_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    $timeout = _$timeout_;

    // Create a set of notes.
    authorUrl = SERVER_CONFIG.apiUrl + 'users/user@example.com/';
    var date = '2013-12-24T17:41:10.871Z';
    rootNote = {
      url: authorUrl + 'pages/1/',
      id: 1,
      parent: '',
      created: date,
      flags: ['root'],
      title: 'Root',
      body: 'This is the root note',
      author: authorUrl
    };
    archiveNote = {
      url: authorUrl + 'pages/2/',
      id: 2,
      parent: '',
      created: date,
      flags: ['archive'],
      title: 'Archive',
      body: 'This is the archive note',
      author: authorUrl
    };
    note4 = {
      url: authorUrl + 'pages/4/',
      id: 4,
      parent: rootNote.url,
      created: date,
      flags: [],
      title: 'Note 4',
      body: 'Note 4',
      author: authorUrl
    };

    // Mock noteResource service
    var deferred = $q.defer();
    deferred.resolve([rootNote, archiveNote, note4]);
    spyOn(noteResource, 'getAll').andReturn(deferred.promise);
  }));



  it('should move notes', function () {
    notes.loadAll();
    $rootScope.$apply();

    var note = notes.getById(note4.id);
    var archive = notes.getById(archiveNote.id);

    spyOn(noteResource, 'put').andReturn();
    note.parent = archive;
    $timeout.flush();
    expect(noteResource.put).toHaveBeenCalledWith(note._json);
    expect(note._json.parent).toEqual(archiveNote.url);
  });

  it('should archive notes', function () {
    notes.loadAll();
    $rootScope.$apply();

    var note = notes.getById(note4.id);
    var archive = notes.getById(archiveNote.id);

    spyOn(noteResource, 'put').andReturn();
    note.archive();
    $timeout.flush();
    expect(noteResource.put).toHaveBeenCalledWith(note._json);
    expect(note._json.parent).toEqual(archiveNote.url);
  });

  it('should convert note from the server format', function () {
    notes.loadAll();
    $rootScope.$apply();

    var note = notes.getById(note4.id);
    expect(note.title).toEqual(note4.title);
    expect(note.body).toEqual(note4.body);
    expect(note.id).toEqual(note4.id);
    expect(note.url).toEqual(note4.url);
    expect(note.isRoot()).toBe(false);
    expect(note.isArchive()).toBe(false);
    expect(note.parent).toBe(notes.getById(rootNote.id));
  });

  it('should throw when asking for parent of root or archive note', function () {
    notes.loadAll();
    $rootScope.$apply();

    var root = notes.getById(rootNote.id);
    expect(root.isRoot()).toBe(true);
    expect(root.isArchive()).toBe(false);
    expect(function () { root.parent; }).toThrow("Root note has no parent");

    var archive = notes.getById(archiveNote.id);
    expect(archive.isRoot()).toBe(false);
    expect(archive.isArchive()).toBe(true);
    expect(function () { archive.parent; }).toThrow("Archive note has no parent"); 
  });
});
