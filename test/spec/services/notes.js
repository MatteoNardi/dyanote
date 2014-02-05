'use strict';

describe('Service: notes', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var notes,
    auth,
    $httpBackend,
    $http,
    $rootScope,
    $log,
    note1,
    note4;

  beforeEach(inject(function (_notes_, _auth_, _$httpBackend_, _$http_, _$rootScope_, _$log_) {
    notes = _notes_;
    auth = _auth_;

    $log = _$log_;
    $http = _$http_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;

    // Mock data
    spyOn(auth, 'isAuthenticated').andReturn(true);
    spyOn(auth, 'getEmail').andReturn('user@example.com');

    note1 = {
      url: "<url>", id: 1, parent: "<parent-url>", created: "2013-12-24T17:41:10.871Z", flags: ["root"],
      title: "<title>", body: "<note>note content</note>", author: "http://dyanote.herokuapp.com/api/users/user@example.com/"
    };

    note4 = {
      url: "<url>", id: 4, parent: "<parent-url>", created: "2013-12-24T17:41:10.871Z", flags: [],
      title: "<title2>", body: "<note>note content 2</note>", author: "http://dyanote.herokuapp.com/api/users/user@example.com/"
    };

    $httpBackend.expect('GET', 'https://dyanote.herokuapp.com/api/users/user@example.com/pages/')
      .respond(200, [note1, note4]);
  }));

  it('should load notes from server', function () {
    notes.loadAll();
    $httpBackend.flush();
    expect(notes.count()).toBe(2);
  });

  it('should allow to get notes by id', function () {
    notes.loadAll();
    $httpBackend.flush();
    expect(JSON.stringify(notes.getById(1))).toEqual(JSON.stringify(note1));
    expect(JSON.stringify(notes.getById(4))).toEqual(JSON.stringify(note4));
    expect(notes.getById(42)).toBeUndefined();
  });

  it('should allow to get root note', function () {
    notes.loadAll();
    $httpBackend.flush();
    expect(JSON.stringify(notes.getRoot())).toEqual(JSON.stringify(note1));
  });

  it('should add interceptor to broken urls', function () {
    // AngularJS removes trailing slashes from urls. We've added an interceptor to fix it.
    $httpBackend.resetExpectations();
    $httpBackend.expect('GET', 'https://dyanote.herokuapp.com/api/abracadabra/').respond(200);
    $http.get('https://dyanote.herokuapp.com/api/abracadabra');
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

    $httpBackend.expect('PUT', 'https://dyanote.herokuapp.com/api/users/user@example.com/pages/1/').respond(200);
    notes.uploadById(note1.id);

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
});
