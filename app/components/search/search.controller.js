'use strict';


// SearchController is responsible for searching notes.
class SearchController {

  constructor ($rootScope, $location, $log, notesGraph, openNotes) {
    this.$rootScope = $rootScope;
    this.$location = $location;
    this.$log = $log;
    this.notesGraph = notesGraph;
    this.openNotes = openNotes;
  }
  
  activate () {
    this.searchTerms = '';
    this.isLoading = false;
    this.results = []

    this.$rootScope.$watch(() => this.searchTerms, text => {
      if (!text) {
        this.isLoading = false;
        this.results = [];
        return;
      } 
      this.$log.info('Searching for "' + text + '"');
      var response = this.notesGraph.search(text);
      this.isLoading = true;
      console.log(response.results);
      this.results = response.results;
      response.promise.then(() => this.isLoading = false);
    });
  }

  open (note) {
    console.log(note);
    this.openNotes.open(note);
    this.$location.path('/notes/view');
  }

  cancel () {
    this.$location.path('/notes/view');
  }
}

angular.module('dyanote').controller('SearchController', SearchController);
