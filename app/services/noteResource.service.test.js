'use strict';

describe('Service: notes', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var noteResource,
    auth,
    SERVER_CONFIG,
    $httpBackend,
    $http,
    $rootScope,
    $log,
    rootNote,
    archiveNote,
    note4,
    authorUrl;

  beforeEach(inject(function (_noteResource_, _auth_, _$httpBackend_, _$http_, _$rootScope_, _$log_, _SERVER_CONFIG_) {
    noteResource = _noteResource_;
    auth = _auth_;
    SERVER_CONFIG = _SERVER_CONFIG_;

    $log = _$log_;
    $http = _$http_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;

    // Mock auth service
    spyOn(auth, 'isAuthenticated').and.returnValue(true);
    spyOn(auth, 'getEmail').and.returnValue('user@example.com');

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
      body: '<note>Root note</note>',
      author: authorUrl
    };
    archiveNote = {
      url: authorUrl + 'pages/2/',
      id: 2,
      parent: '',
      created: date,
      flags: ['archive'],
      title: 'Archive',
      body: '<note>Archive note</note>',
      author: authorUrl
    };
    note4 = {
      url: authorUrl + 'pages/4/',
      id: 4,
      parent: rootNote.url,
      created: date,
      flags: [],
      title: 'Note 4',
      body: '<note>Note 4</note>',
      author: authorUrl
    };
  }));

  it('should load notes from server', function () {
    var count = 0;
    $httpBackend.expect('GET', authorUrl + 'pages/')
      .respond(200, [rootNote, archiveNote, note4]);

    noteResource.getAll().then(function (notes) {
      count = notes.length;
    });
    $rootScope.$apply();
    $httpBackend.flush();
    expect(count).toBe(3);
  });

  it('should fail if user is not logged in', function () {
    auth.isAuthenticated.and.returnValue(false);
    var promise = noteResource.getAll();
    var msg = 'No error';
    promise.then(null, function (reason) {
      msg = reason;
    });
    $rootScope.$apply();
    expect(msg).toEqual('User is not logged in');
  });

  it('should upload notes to server', function () {
    $httpBackend.expect('PUT', rootNote.url).respond(200);
    noteResource.put(rootNote);

    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest()
  });

  it('should create new notes', function () {
    var uncompletedNote4 = JSON.parse(JSON.stringify(note4));
    delete uncompletedNote4.id;
    delete uncompletedNote4.url;
    var completedNote4;
    $httpBackend.expect('POST', authorUrl + 'pages/').respond(note4);
    noteResource.post(uncompletedNote4).then(function (note) {
      completedNote4 = note;
    });
    $httpBackend.flush();
    $rootScope.$apply();
    expect(completedNote4.id).toEqual(note4.id);
    expect(completedNote4).toEqual(note4);

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest()
  });
});
