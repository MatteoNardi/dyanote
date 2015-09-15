
// Controller for the notes view.
// It is responsible for navigation (via breadcrumb or clicked links)
class NotesController {
  constructor ($scope, $timeout, openNotes, notesGraph, notesManager) {
    this.$timeout = $timeout;
    this.openNotes = openNotes;
    this.notesGraph = notesGraph;
    this.notesManager = notesManager;
  }

  activate () {
    this.notes = this.openNotes.notes;
  }

  onBreadcrumbItemClicked ($event, note) {
    $event.preventDefault();
    this.openNotes.focus(note);
  }

  trash (note) {
    this.notesManager.trashNote(note);
    var pos = this.openNotes.notes.indexOf(note);

    if (pos > 0) {
      var previous = this.openNotes.notes[pos -1];
      this.openNotes.focus(previous);
      this.$timeout(() => this.openNotes.close(note) , 500);
    }
  }

  title (note) {
    var me = this;
    return function () {
      if (arguments.length === 0)
        return me.notesGraph.title(note);
      else
        me.notesManager.setTitle(note, arguments[0]);
    };
  }
}

angular.module('dyanote').controller('NotesController', NotesController);
