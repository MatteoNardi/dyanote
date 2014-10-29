'use strict';

angular.module('dyanote')

// Controller for the notes view.
// It is responsible for navigation (via breadcrumb or clicked links)
.controller('NotesCtrl', function ($scope, $log, $location, $timeout, notesManager, notesGraph, status) {
  $scope.notes = [];

  // Load notes
  if (notesGraph.count() > 0) {
    // Reopen the last opened note if we have one.
    if (!status.currentNote)
      status.currentNote = notesGraph.getRoot();
    for (var i = status.currentNote; i.hasParent(); i = i.parent)
      $scope.notes.unshift(i);
    $scope.notes.unshift(i);
  } else {
    // Get notes from server if we haven't yet done it.
    var req = notesManager.loadAll();
    req.then(function () {
      $log.info("Loaded notes: " + notesGraph.count());
      status.currentNote = notesGraph.getRoot();
      $scope.notes.push(notesGraph.getRoot());
    }, function (reason) {
      $log.info("Loading notes failed: " + reason);
      $location.path("/login");
    });
  }

  $scope.$on('$openNote', function (event, callerNoteId, targetNoteId) {
    var callerNote = notesGraph.getById(callerNoteId);
    var targetNote = notesGraph.getById(targetNoteId);
    status.currentNote = targetNote;

    // If note isn't already open, open it.
    if ($scope.notes.indexOf(targetNote) == -1) {
      // Close notes after callerNote
      var callerPosition = $scope.notes.indexOf(callerNote);
      if (callerPosition == -1) { $log.error('caller note not found'); return; }
      $scope.notes = $scope.notes.slice(0, callerPosition + 1);
      // Open current note
      $scope.notes.push(targetNote);
    }
    // If note is already open, scroll to it.
    else {
      $scope.$broadcast('$scrollToNote', targetNote);
    }

    event.preventDefault();
    event.stopPropagation();
  });

  $scope.onBreadcrumbItemClicked = function ($event, note) {
    $event.preventDefault();
    status.currentNote = note;
    $scope.$broadcast('$scrollToNote', note);
  };

  $scope.archive = function (note) {
    note.archive();
    // Close note
    var pos = $scope.notes.indexOf(note);
    if (pos > 0) {
      status.currentNote = $scope.notes[pos - 1];
      $scope.$broadcast('$scrollToNote', status.currentNote);
      $timeout(function () {
        $scope.notes = $scope.notes.slice(0, pos);
      }, 500);
    }
  };

  // Show a dialog to move the note to a new parent.
  $scope.showMoveDialog = function (note) {
    console.log('show move dialog', note);
  }
})

// This variable holds the currently opened note.
// It's contained in it's own service because we don't want it
// to get lost on route change.
.value('status', {
  currentNote: undefined
});
