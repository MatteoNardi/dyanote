'use strict';

angular.module('dyanote')

// SearchCtrl is responsible for searching notes.
.controller('SearchCtrl', function ($scope, $location, $log, notes, status) {
  
  // Load notes if needed
  if (notes.count() == undefined)
    notes.loadAll();

  $scope.$watch('searchText', function (newValue, oldValue) {
    var text = newValue;
    if (!text) {
      $scope.isLoading = false;
      $scope.results = [];
      return;
    } 
    $log.info('Searching for "' + text + '"');
    var response = notes.search(text);
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
