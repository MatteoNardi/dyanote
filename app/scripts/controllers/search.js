'use strict';

angular.module('dyanote')

// SearchCtrl is responsible for searching notes.
.controller('SearchCtrl', function ($scope, $location, $log, notesGraph, notesManager, $rootScope) {
  $scope.input = {
    searchTerms: ''
  };

  $scope.$watch('input.searchTerms', function (newValue, oldValue) {
    var text = newValue;
    if (!text) {
      $scope.isLoading = false;
      $scope.results = [];
      return;
    } 
    $log.info('Searching for "' + text + '"');
    var response = notesGraph.search(text);
    $scope.isLoading = true;
    $scope.results = response.results;
    response.promise.then(function () {
      $scope.isLoading = false;
    });
  });

  $scope.open = function (note) {
    console.log(note);
    $rootScope.currentNote = note;
    $location.path('/notes');
  }

  $scope.cancel = function () {
    $location.path('/notes');
  }

  $scope.isLoading = false;
  $scope.results = [];
});
