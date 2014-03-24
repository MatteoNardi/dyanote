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

  it('should upload notes to server when body changes', function () {
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
});
