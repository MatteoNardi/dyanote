
// SearchController is responsible for searching notes.
class SearchController {

  constructor ($rootScope, $location, $log, notesGraph, openNotes) {
    this.$rootScope = $rootScope;
    this.$location = $location;
    this.$log = $log;
    this.notesGraph = notesGraph;
    this.openNotes = openNotes;
    this.activate();
  }

  activate () {
    this.searchTerms = '';
    this.isLoading = false;
    this.results = [];

    this.$rootScope.$watch(() => this.searchTerms, text => {
      if (!text) {
        this.isLoading = false;
        this.results = [];
        return;
      }
      this.$log.info('Searching for "' + text + '"');
      this.isLoading = true;
      // Todo: case insensitive
      var contains = x => x && x.indexOf(text) != -1;
      var response = this._search(note =>
        contains(this.notesGraph.body(note)) ||
        contains(this.notesGraph.title(note))
      );
    });
  }

  _search (predicate) {
    if (this.runningSearch) {
      clearTimeout(this.runningSearch);
      this.results.length = 0;
      console.info('clear', this.results);
    }
    var graph = this.notesGraph;
    var queue = graph.roots();
    console.warn('serach', queue);
    var digest = _ => this.$rootScope.$$phase || this.$rootScope.$apply();
    var process = _ => {
      var item = queue.shift();
      if (item === undefined) return;
      queue = queue.concat(graph.children(item));
      if (predicate(item) && this.results.indexOf(item) == -1) {
        this.results.push(item);
        digest();
        console.info('change', this.results);
      }
      if (queue.length) this.runningSearch = setTimeout(process, 0);
    };
    process();
    // on end: this.isLoading = false;
  }

  open (note) {
    // console.log(note);
    this.openNotes.open(note);
  }
}

angular.module('dyanote').controller('SearchController', SearchController);
