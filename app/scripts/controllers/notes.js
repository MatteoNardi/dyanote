'use strict';

angular.module('dyanote')

// Controller for the notes view
.controller('NotesCtrl', function ($scope, $log, $location, notes) {
  $scope.notes = [];

  var req = notes.loadAll();
  req.then(function () {
    $log.info("Loaded notes: " + notes.count());
    $scope.notes.push(notes.getRoot());
  }, function (reason) {
    $log.info("Loading notes failed: " + reason);
    $location.path("/login");
  });

  $scope.$on('$locationChangeStart', function (event, oldUrl, newUrl) {
    // Todo: close unwanted notes.
    $scope.notes.push(notes.getById($location.hash()));
    event.preventDefault();
  });
});
