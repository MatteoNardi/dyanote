
// Controller for the notes view.
// It is responsible for navigation (via breadcrumb or clicked links)
class NotesController {
  constructor ($log, $timeout, openNotes) {
    this.$log = $log;
    this.$timeout = $timeout;
    this.openNotes = openNotes;
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
    var pos = this.openNotes.notes.indexOf(note);

    if (pos > 0) {
      var previous = this.openNotes.notes[pos -1];
      this.openNotes.focus(previous);
      $timeout(function () {
        this.openNotes.close(note);
      }, 500);
    }
  }
}

angular.module('dyanote').controller('NotesController', NotesController);
