'use strict';

describe('Controller: SearchCtrl', function () {

  // load the controller's module
  beforeEach(module('dyanote'));

  var SearchCtrl,
    notesGraph,
    scope,
    $q,
    $rootScope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, _$rootScope_, _notesGraph_, _$q_) {
    notesGraph = _notesGraph_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    SearchCtrl = $controller('SearchCtrl', {
      $scope: scope
    });
  }));

  it('search for notes', function () {
    var deferred = $q.defer();
    var results = [];
    spyOn(notesGraph, 'search').and.callFake(function (text) {
      if (text == 'abracadabra') return {
        results: results,
        promise: deferred.promise
      }
    });

    scope.input.searchTerms = 'abracadabra';
    $rootScope.$apply();
    expect(scope.isLoading).toBe(true);
    expect(scope.results.length).toBe(0);

    var note1 = { title: 'Note abracadabra' };
    results.push(note1);
    expect(scope.isLoading).toBe(true);
    expect(scope.results).toEqual([note1]);

    var note2 = { title: 'Abracadabra' };
    results.push(note2);
    deferred.resolve();
    $rootScope.$apply();

    expect(scope.isLoading).toBe(false);
    expect(scope.results).toEqual([note1, note2]);
  });

  it('should reset search when searched text is empy', function () {
    scope.results = ['r1', 'r2'];
    scope.isLoading = true;

    scope.input.searchTerms = '';
    $rootScope.$apply();

    expect(scope.results.length).toBe(0);
    expect(scope.isLoading).toBe(false);
  });
});
