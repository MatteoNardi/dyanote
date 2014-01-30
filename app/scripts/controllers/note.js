'use strict';

angular.module('dyanote')

.controller('NoteCtrl', function ($scope, $log) {
  $scope.$watch('note.body', function(newValue, oldValue) {
    $log.info("NoteCtrl. Note body changed:\n" + newValue);
  });
});
