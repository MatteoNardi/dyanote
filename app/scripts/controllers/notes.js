'use strict';

angular.module('dyanote')

// Controller for the notes view.
// It is responsible for navigation (via breadcrumb or clicked links)
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

  $scope.$on('$openNote', function (event, callerNoteId, targetNoteId) {
    var callerNote = notes.getById(callerNoteId);
    var targetNote = notes.getById(targetNoteId);

    // If note isn't already open, open it.
    if ($scope.notes.indexOf(targetNote) == -1) {
      // Close notes after callerNote
      var callerPosition = $scope.notes.indexOf(callerNote);
      if (callerPosition == -1) { $log.error('caller note not found'); return; }
      $scope.notes = $scope.notes.slice(0, callerPosition + 1);
      // Open targetNote
      $scope.notes.push(targetNote);
    }
    // If note is already open, scroll to it.
    else {
      $scope.$broadcast('$scrollToNote', targetNoteId);
    }

    // Todo: add hash to location
    // Todo: on load, open note in location
    event.preventDefault();
    event.stopPropagation();
  });

  $scope.onBreadcrumbItemClicked = function ($event, noteId) {
    $event.preventDefault();
    $scope.$broadcast('$scrollToNote', noteId);
  };
});
