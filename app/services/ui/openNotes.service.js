
// Service keeping track of notes currently open in the UI.
class openNotes {
    
  constructor () {
    this._notes = [];
  }

  // Ordered list which starts from the root/archive note
  // and ends with the last opened one.
  get notes () {
    return this._notes;
  }

  // Replace curretly open notes with the given note and its ancestors.
  open (note, insertAfter) {
    this.notes.length = 0;
    while (note) {
      this.notes.unshift(note);
      note = note.hasParent() && note.parent; 
    }
  }

  // Replace the insertAfter note and  the following ones
  // with the given note.
  openAfter (note, insertAfter) {
    var insertPos = this.notes.indexOf(insertAfter);
    this.notes.length = insertPos + 1;
    this.notes.push(note);
  }
  
  // Close a note and the following ones.
  close (note) {
    var pos = this.notes.indexOf(note);
    if (pos != -1)
      this.notes.length = pos;
  }
}

angular.module('dyanote').service('openNotes', openNotes);
