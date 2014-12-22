'use strict';

angular.module('dyanote')

// Service keeping track of notes currently open in the UI.
.service('openNotes', function () {

  // Ordered list which starts from the root/archive note
  // and ends with the last opened one.
  this.notes = [];

  // Open a new note. 
  // The caller optional parameter may specify where to insert it.
  // Default behaviour is replacing curretly open notes with note
  // and its ancestors.
  this.open = function (note, insertAfter) {
    var insertPos = this.notes.indexOf(insertAfter);
    if (insertPos != -1) {
      this.notes.length = insertPos + 1;
      this.notes.push(note);
    } else {
      this.notes.length = 0;
      while (note) {
        this.notes.unshift(note);
        note = note.hasParent() && note.parent; 
      }
    } 
  }

  // Close a note and the following ones.
  this.close = function (note) {
    var pos = this.notes.indexOf(note);
    if (pos != -1)
      this.notes.length = pos;
  }
});
