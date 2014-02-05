'use strict';

angular.module('dyanote')

// Controller of a single note.
// Is responsible for calling notes.uploadById(note.id) on note change.
.controller('NoteCtrl', function ($scope, notes, $log) {
  $scope.$watch('note.body', function(newValue, oldValue) {
    if (newValue !== oldValue) {
        $log.info("NoteCtrl. Uploading note " + $scope.note.id);
        notes.uploadById($scope.note.id);
    }
  });
});
