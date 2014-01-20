'use strict';

angular.module('dyanote')

// Controller for the notes view
.controller('NotesCtrl', function ($scope, $log, notes) {
  $scope.notes = [];

  var req = notes.loadAll();
  req.then(function () {
    $log.info("Loaded notes: " + notes.count());
    $scope.notes.push(notes.getRoot());
  })
});
