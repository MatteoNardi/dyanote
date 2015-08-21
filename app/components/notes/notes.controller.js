
// Controller for the notes view.
// It is responsible for navigation (via breadcrumb or clicked links)
class NotesController {
  constructor ($scope, $timeout, openNotes, notesGraph, notesManager) {
    this.$timeout = $timeout;
    this.openNotes = openNotes;
    this.notesGraph = notesGraph;
    this.notesManger = notesManger;
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
      this.$timeout(() => this.openNotes.close(note) , 500);
    }
  }

  title (note) {
    return {
      get: _ => this.notesGraph.title(note),
      set: t => this.notesManager.setTitle(t)
    };
  }
}

angular.module('dyanote').controller('NotesController', NotesController);
