
describe('SearchController', function () {

  // load the controller's module
  beforeEach(module('dyanote'));

  // Dependencies
  var _ = {};

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, notesGraph, $q) {
    _.notesGraph = notesGraph;
    _.$q = $q;
    _.$rootScope = $rootScope;
    _.$controller = $controller;
  }));

  it('search for notes', function () {
    var SearchController = _.$controller('SearchController');
    SearchController.activate();
    var deferred = _.$q.defer();
    var results = [];
    spyOn(_.notesGraph, 'search').and.callFake(function (text) {
      if (text == 'abracadabra') return {
        results: results,
        promise: deferred.promise
      }
    });

    SearchController.input.searchTerms = 'abracadabra';
    _.$rootScope.$apply();
    expect(SearchController.isLoading).toBe(true);
    expect(SearchController.results.length).toBe(0);

    var note1 = { title: 'Note abracadabra' };
    results.push(note1);
    expect(SearchController.isLoading).toBe(true);
    expect(SearchController.results).toEqual([note1]);

    var note2 = { title: 'Abracadabra' };
    results.push(note2);
    deferred.resolve();
    _.$rootScope.$apply();

    expect(SearchController.isLoading).toBe(false);
    expect(SearchController.results).toEqual([note1, note2]);
  });

  it('should reset search when searched text is empy', function () {
    var SearchController = _.$controller('SearchController');
    SearchController.activate();
    SearchController.results = ['r1', 'r2'];
    SearchController.isLoading = true;

    SearchController.input.searchTerms = '';
    _.$rootScope.$apply();

    expect(SearchController.results.length).toBe(0);
    expect(SearchController.isLoading).toBe(false);
  });
});
