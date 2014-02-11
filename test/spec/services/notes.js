'use strict';

describe('Service: notes', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var notes,
    auth,
    SERVER_CONFIG,
    $httpBackend,
    $http,
    $rootScope,
    $log,
    rootNote,
    archiveNote,
    note4;

  beforeEach(inject(function (_notes_, _auth_, _$httpBackend_, _$http_, _$rootScope_, _$log_, _SERVER_CONFIG_) {
    notes = _notes_;
    auth = _auth_;
    SERVER_CONFIG = _SERVER_CONFIG_;

    $log = _$log_;
    $http = _$http_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;

    // Mock auth service
    spyOn(auth, 'isAuthenticated').andReturn(true);
    spyOn(auth, 'getEmail').andReturn('user@example.com');

    // Create a set of notes.
    var authorUrl = SERVER_CONFIG.apiUrl + "users/user@example.com/";
    var date = "2013-12-24T17:41:10.871Z";
    rootNote = {
      url: authorUrl + "pages/1/",
      id: 1,
      parent: "",
      created: date,
      flags: ["root"],
      title: "Root",
      body: "<note>Root note</note>",
      author: authorUrl
    };
    archiveNote = {
      url: authorUrl + "pages/2/",
      id: 2,
      parent: "",
      created: date,
      flags: ["trash"],
      title: "Archive",
      body: "<note>Archive note</note>",
      author: authorUrl
    };
    note4 = {
      url: authorUrl + "pages/4/",
      id: 4,
      parent: rootNote.url,
      created: date,
      flags: [],
      title: "Note 4",
      body: "<note>Note 4</note>",
      author: authorUrl
    };

    $httpBackend.expect('GET', authorUrl + 'pages/')
      .respond(200, [rootNote, archiveNote, note4]);
  }));


  it('should load notes from server', function () {
    notes.loadAll();
    $httpBackend.flush();
    expect(notes.count()).toBe(3);
  });

  it('should allow to get notes by id', function () {
    notes.loadAll();
    $httpBackend.flush();
    expect(JSON.stringify(notes.getById(1))).toEqual(JSON.stringify(rootNote));
    expect(JSON.stringify(notes.getById(4))).toEqual(JSON.stringify(note4));
    expect(notes.getById(42)).toBeUndefined();
  });

  it('should allow to get root note', function () {
    notes.loadAll();
    $httpBackend.flush();
    expect(JSON.stringify(notes.getRoot())).toEqual(JSON.stringify(rootNote));
  });

  it('should allow to get archive note', function () {
    notes.loadAll();
    $httpBackend.flush();
    expect(JSON.stringify(notes.getArchive())).toEqual(JSON.stringify(archiveNote));
  });

  it('should add interceptor to broken urls', function () {
    // AngularJS removes trailing slashes from urls. We've added an interceptor to fix it.
    $httpBackend.resetExpectations();
    var url = SERVER_CONFIG.apiUrl + 'abracadabra/';
    $httpBackend.expect('GET', url).respond(200);
    $http.get(url);
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest()
  });

  it('should fail if user is not logged in', function () {
    $httpBackend.resetExpectations();
    auth.isAuthenticated.andReturn(false);
    var promise = notes.loadAll();
    var msg = 'No error';
    promise.catch(function (reason) {
      msg = reason;
    });
    $rootScope.$apply();
    expect(msg).toEqual('User is not logged in');
  });

  it('should upload notes to server', function () {
    notes.loadAll();
    $httpBackend.flush();

    $httpBackend.expect('PUT', rootNote.url).respond(200);
    notes.uploadById(rootNote.id);

    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest()
  });

  it('should complain when note doesnt exist', function () {
    notes.loadAll();
    $httpBackend.flush();

    notes.uploadById(231421323);

    expect($log.error.logs.shift().shift()).toBe('uploadById: No note with id 231421323');

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest()
  });

  it('should move notes', function () {
    notes.loadAll();
    $httpBackend.flush();

    $httpBackend.expect('PUT', note4.url).respond(200);
    notes.changeParent(note4.id, archiveNote.id);
    expect(notes.getById(note4.id).parent).toBe(archiveNote.url);
    expect(notes.getById(note4.id).parentId).toBe(archiveNote.id);
  })


  it('should move notes to trash', function () {
    notes.loadAll();
    $httpBackend.flush();

    $httpBackend.expect('PUT', note4.url).respond(200);
    notes.archive(note4.id);
    expect(notes.getById(note4.id).parent).toBe(archiveNote.url);
    expect(notes.getById(note4.id).parentId).toBe(archiveNote.id);
  })
});
