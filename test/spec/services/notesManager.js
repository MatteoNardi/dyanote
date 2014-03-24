'use strict';

describe('Service: notesManager', function () {
  beforeEach(module('dyanote'));

  var notesManager,
    notesGraph,
    noteResource,
    notesFactory,
    $q,
    $rootScope;

  beforeEach(inject(function (_$q_, _$rootScope_, _notesManager_, _notesGraph_, _noteResource_, _notesFactory_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    notesManager = _notesManager_;
    notesGraph = _notesGraph_;
    noteResource = _noteResource_;
    notesFactory = _notesFactory_;
  }));

  it('should load notes from server', function () {
    var deferred = $q.defer();
    spyOn(noteResource, 'getAll').andReturn(deferred.promise);
    var note1 = { title: '1'};
    var note2 = { title: '2'};
    deferred.resolve([note1, note2]);

    var signal = { addHandler: function () {} };
    spyOn(notesFactory, 'newNote').andReturn({
      changedSignal: signal,
      parentChangedSignal: signal
    });
    spyOn(signal, 'addHandler');

    notesManager.loadAll();
    $rootScope.$apply();

    expect(notesFactory.newNote).toHaveBeenCalledWith(note1);
    expect(notesFactory.newNote).toHaveBeenCalledWith(note2);
    expect(signal.addHandler).toHaveBeenCalled();
  });

  it('should fail if user is not logged in', function () {
    spyOn(noteResource, 'getAll').andReturn($q.reject("User is not logged in"));
    var promise = notesManager.loadAll();
    var msg;
    promise.catch(function (reason) {
      msg = reason;
    });
    $rootScope.$apply();
    expect(msg).toEqual('User is not logged in');
  });

  it('should upload notes to server when note changes', function () {
    var deferred = $q.defer();
    spyOn(noteResource, 'getAll').andReturn(deferred.promise);
    var json = {
      id: 0,
      title: 'Note title',
      body: '<h1>Header</h1>..body.'
    };
    deferred.resolve([json]);

    notesManager.loadAll();
    $rootScope.$apply();

    spyOn(noteResource, 'put').andReturn();

    notesGraph.getById(0).title = 'New Title';
    $rootScope.$apply();
    inject(function ($timeout) { $timeout.flush(); });
    expect(noteResource.put).toHaveBeenCalledWith(json);
  });


  it('should create new notes immediately', function () {
    var deferred = $q.defer(); 
    spyOn(noteResource, 'post').andReturn(deferred.promise);

    var parent = { url: 'http://dyanote.com/parenturl/0/' };
    var newNote = notesManager.newNote(parent, "Title", "Body");

    expect(noteResource.post).toHaveBeenCalledWith(newNote._json);
    expect(newNote.title).toEqual("Title");
    expect(newNote.body).toEqual("Body");
    expect(newNote.url).toBeTruthy();
    expect(newNote.id).toBeTruthy();
  });

  it('should complete newly created notes when server responds', function () {
    var d = $q.defer();
    spyOn(noteResource, 'getAll').andReturn(d.promise);
    var json = {
      id: 0,
      url: 'http://dyanote.com/parenturl/0/',
      title: 'Note title',
      body: '<h1>Header</h1>..body.'
    };
    d.resolve([json]);
    notesManager.loadAll();
    $rootScope.$apply();

    var deferred = $q.defer();
    spyOn(noteResource, 'post').andReturn(deferred.promise);
    var parent = { url: 'http://dyanote.com/parenturl/0/' };
    var newNote = notesManager.newNote(parent, "Title", "Body");

    deferred.resolve({'id': 42, 'url': 'http://dyanote.com/parenturl/0/'});
    $rootScope.$apply();

    expect(newNote.id).toEqual(42);
    expect(newNote.url).toEqual('http://dyanote.com/parenturl/0/');
  });

});
