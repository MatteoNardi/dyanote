'use strict';

angular.module('dyanote')

// SearchCtrl is responsible for searching notes.
.controller('SearchCtrl', function ($scope, $location, $log, notesGraph, notesManager, status) {

  // Todo: doing this everywhere is ugly, find another solution.
  // Load notes if needed
  if (notesGraph.count() == undefined)
    notesManager.loadAll();

  $scope.$watch('searchText', function (newValue, oldValue) {
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
    status.currentNote = note;
    $location.path('/notes');
  }

  $scope.cancel = function () {
    $location.path('/notes');
  }

  $scope.isLoading = false;
  $scope.results = [];
});
