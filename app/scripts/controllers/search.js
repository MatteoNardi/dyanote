'use strict';

angular.module('dyanote')

// SearchCtrl is responsible for searching notes.
.controller('SearchCtrl', function ($scope, $log, notes) {
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

  $scope.isLoading = false;
  $scope.results = [];
});
