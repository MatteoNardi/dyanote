'use strict';


// Controller for the notes view.
// It is responsible for navigation (via breadcrumb or clicked links)
class NotesController {
  constructor ($log, $timeout, openNotes, notesGraph, notesManager, auth) {
    this.$log = $log,
    this.$timeout = $timeout,
    this.openNotes = openNotes,
    this.notesGraph = notesGraph,
    this.notesManager = notesManager,
    this.auth = auth
  }

  canActivate () {
    if (this.notesGraph.count()) {
      this.$log.info('NotesController canActivate: true (notes already loaded)');
      return true;
    }
    if (!auth.isAuthenticated()) {
      this.$log.warn('NotesController canActivate: false (user not logged in)');
      return false;
    }
    return this.notesManager.loadAll().then(function () {
      this.$log.info('NotesController canActivate: true (loaded notes)');
      return true;
    }, function () {
      this.$log.warn('NotesController canActivate: false (cant read notes)');
      return false;
    });
  }

  activate () {
    this.notes = this.openNotes.notes;
  }  

  onBreadcrumbItemClicked ($event, note) {
    $event.preventDefault();
    this.openNotes.focus(note);
  }

  archive (note) {
    note.archive();
    var pos = openNotes.notes.indexOf(note);

    if (pos > 0) {
      var previous = openNotes.notes[pos -1];
      this.openNotes.focus(previous);
      $timeout(function () {
        openNotes.close(note);
      }, 500);
    }
  }

  // Show a dialog to move the note to a new parent.
  showMoveDialog (note) {
    console.log('show move dialog', note);
  }
}

angular.module('dyanote').controller('NotesController', NotesController);
