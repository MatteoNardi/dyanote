'use strict';

describe('Service: notes', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var notes,
    noteResource,
    $rootScope,
    $log,
    $q,
    rootNote,
    archiveNote,
    note4,
    authorUrl;

  beforeEach(inject(function (_notes_, _noteResource_, _$rootScope_, _$log_, _$q_, SERVER_CONFIG) {
    notes = _notes_;
    noteResource = _noteResource_;

    $log = _$log_;
    $rootScope = _$rootScope_;
    $q = _$q_;

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
      body: 'Root note',
      author: authorUrl
    };
    archiveNote = {
      url: authorUrl + 'pages/2/',
      id: 2,
      parent: '',
      created: date,
      flags: ['archive'],
      title: 'Archive',
      body: 'Archive note',
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


  it('should load notes from server', function () {
    notes.loadAll();
    $rootScope.$apply();
    expect(notes.count()).toBe(3);
  });

  it('should allow to get notes by id', function () {
    notes.loadAll();
    $rootScope.$apply();
    expect(JSON.stringify(notes.getById(1)._json)).toEqual(JSON.stringify(rootNote));
    expect(JSON.stringify(notes.getById(4)._json)).toEqual(JSON.stringify(note4));
    expect(function () { notes.getById(42); }).toThrow('Note 42 not found.');
  });

  it('should allow to get root note', function () {
    notes.loadAll();
    $rootScope.$apply();
    expect(JSON.stringify(notes.getRoot()._json)).toEqual(JSON.stringify(rootNote));
  });

  it('should allow to get archive note', function () {
    notes.loadAll();
    $rootScope.$apply();
    expect(JSON.stringify(notes.getArchive()._json)).toEqual(JSON.stringify(archiveNote));
  });

  it('should fail if user is not logged in', function () {
    noteResource.getAll.andReturn($q.reject("User is not logged in"));
    var promise = notes.loadAll();
    var msg;
    promise.catch(function (reason) {
      msg = reason;
    });
    $rootScope.$apply();
    expect(msg).toEqual('User is not logged in');
  });

  it('should upload notes to server when body changes', function () {
    notes.loadAll();
    $rootScope.$apply();

    spyOn(noteResource, 'put').andReturn();
    var root = notes.getById(rootNote.id);
    root.setBody("Abracadabra");
    $rootScope.$apply();

    expect(noteResource.put).toHaveBeenCalledWith(root._json);
  });

  it('should upload notes to server when title changes', function () {
    notes.loadAll();
    $rootScope.$apply();

    spyOn(noteResource, 'put').andReturn();
    var root = notes.getById(rootNote.id);
    root.setTitle("Abracadabra");
    $rootScope.$apply();

    expect(noteResource.put).toHaveBeenCalledWith(root._json);
  });

  it('should complain when note doesnt exist', function () {
    notes.loadAll();
    $rootScope.$apply();

    expect(function () { notes.getById(231421323); }).toThrow('Note 231421323 not found.');
  });

  it('should move notes', function () {
    notes.loadAll();
    $rootScope.$apply();

    var note = notes.getById(note4.id);
    var archive = notes.getById(archiveNote.id);

    spyOn(noteResource, 'put').andReturn();
    note.setParent(archive);
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
    expect(noteResource.put).toHaveBeenCalledWith(note._json);
    expect(note._json.parent).toEqual(archiveNote.url);
  });

  it('should convert note from the server format', function () {
    notes.loadAll();
    $rootScope.$apply();

    var note = notes.getById(note4.id);
    expect(note.getTitle()).toEqual(note4.title);
    expect(note.getBody()).toEqual(note4.body);
    expect(note.getId()).toEqual(note4.id);
    expect(note.getUrl()).toEqual(note4.url);
    expect(note.isRoot()).toBe(false);
    expect(note.isArchive()).toBe(false);
    expect(note.getParent()).toBe(notes.getById(rootNote.id));
  });

  it('should throw when asking for parent of root or archive note', function () {
    notes.loadAll();
    $rootScope.$apply();

    var root = notes.getById(rootNote.id);
    expect(root.isRoot()).toBe(true);
    expect(root.isArchive()).toBe(false);
    expect(function () { root.getParent(); }).toThrow("Root note has no parent");

    var archive = notes.getById(archiveNote.id);
    expect(archive.isRoot()).toBe(false);
    expect(archive.isArchive()).toBe(true);
    expect(function () { archive.getParent(); }).toThrow("Archive note has no parent"); 
  });

  it('should create new notes immediately', function () {
    notes.loadAll();
    $rootScope.$apply();

    var deferred = $q.defer(); 
    spyOn(noteResource, 'post').andReturn(deferred.promise);

    var root = notes.getById(rootNote.id);
    var n5 = notes.newNote(root, "Title", "Body");

    expect(noteResource.post).toHaveBeenCalledWith(n5._json);
    expect(n5.getTitle()).toEqual("Title");
    expect(n5.getBody()).toEqual("Body");
    expect(n5.getParent()).toBe(root);
    expect(n5.getUrl()).toBeTruthy();
    expect(n5.getId()).toBeTruthy();
  });

  it('should complete newly created notes when server responds', function () {
    notes.loadAll();
    $rootScope.$apply();

    var deferred = $q.defer(); 
    spyOn(noteResource, 'post').andReturn(deferred.promise);

    var root = notes.getById(rootNote.id);
    var n5 = notes.newNote(root, "Title", "Body");

    var note5 = JSON.parse(JSON.stringify(note4));
    note5.id = 5;
    note5.url = note5.url.replace('/4/', '/5/');
    deferred.resolve(note5);
    $rootScope.$apply();

    expect(n5.getId()).toEqual(5);
    expect(n5.getUrl()).toEqual(note5.url);
    expect(notes.getById(5)).toBe(n5);
  });

  describe('NotesCoherenceTools', function () {
    it('should replace links using removeFakeLinks', function () {
      notes.loadAll();
      $rootScope.$apply();
      var deferred = $q.defer(); 
      spyOn(noteResource, 'post').andReturn(deferred.promise);
      spyOn(noteResource, 'put').andReturn();

      var root = notes.getById(rootNote.id);
      var n5 = notes.newNote(root, "Title", "Body");

      root.setBody(root.getBody() + '<a href="' + n5.getUrl() + '">Title</a>');

      var note5 = JSON.parse(JSON.stringify(note4));
      note5.id = 5;
      note5.url = note5.url.replace('/4/', '/5/');
      note5.parent = note5.url.replace('/4/', '/5/');
      //console.log(note5.url);
      deferred.resolve(note5);
      $rootScope.$apply();

      // Now called automatically.
      // notes.NotesCoherenceTools.removeFakeLinks(root);

      expect(root.getBody()).toEqual('Root note<a href="' + n5.getUrl() + '">Title</a>');
    });

    it('should remove dead links using removeDeadLinks', function () {
      notes.loadAll();
      $rootScope.$apply();

      var root = notes.getById(rootNote.id);
      var n4 = notes.getById(note4.id);
      root.setBody(root.getBody() + '<a href="' + n4.getUrl() + '">Note 4</a>');
      root.setBody(root.getBody() + '<a href="' + n4.getUrl() + '">Note 4</a>');
      n4.archive();
 
      notes.NotesCoherenceTools.removeDeadLinks(root);
      expect(root.getBody().indexOf("Note 4")).toEqual(-1);
    });
  });
});
