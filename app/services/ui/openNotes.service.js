
// Mantains the list of the notes currently opened by the user.
// Has a focus event.
class openNotes {
    
  constructor () {
    this._notes = [];
    this._focusHandlers = [];
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

  // Focus event: used to move to/highlight a particular note

  focus (note) {
    this._focusHandlers.forEach(cb => cb(note));
  }

  addFocusHandler (cb) {
    this._focusHandlers.push(cb);
  }

  removeFocusHandler (cb) {
    var index = this._focusHandlers.indexOf(cb);
    if (index != -1)
      this._focusHandlers.splice(index, 1);
  }
}

angular.module('dyanote').service('openNotes', openNotes);
