'use strict';

angular.module('dyanote')

// Controller of a single note.
// Is responsible for updating the note and deleting it.
.controller('NoteCtrl', function ($scope, notes, $log) {
  $scope.$watch('note.body', function(newValue, oldValue) {
    if (newValue !== oldValue) {
        $log.info("NoteCtrl. Uploading note " + $scope.note.id);
        notes.uploadById($scope.note.id);
    }
  });

  $scope.moveToTrash = function() {
      $log.info("NoteCtrl. Moving to trash note " + $scope.note.id);
      notes.archive($scope.note.id);
  }
});
