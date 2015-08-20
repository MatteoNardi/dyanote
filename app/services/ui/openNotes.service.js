
// Mantains the list of the notes currently opened by the user.
// Has a focus event.
class openNotes {

  constructor (notesGraph) {
    this.notesGraph = notesGraph;
    this._notes = [];
    this._set = new Set();
    this._focusHandlers = [];
    this._openHandlers = [];
  }

  // Ordered list which starts from the root/archive note
  // and ends with the last opened one.
  get notes () {
    return this._notes;
  }

  isOpen (note) {
    return this._set.has(note);
  }

  // Replace curretly open notes with the given note and its ancestors.
  open (note) {
    this.notes.length = 0;
    this._set.clear();
    while (note) {
      this._openHandlers.forEach(cb => cb(note));
      this.notes.unshift(note);
      this._set.add(note);
      note = this.notesGraph.parent(note);
    }
  }

  // Replace the insertAfter note and  the following ones
  // with the given note.
  openAfter (note, insertAfter) {
    var insertPos = this.notes.indexOf(insertAfter);
    for (var i = insertPos + 1; i < this.notes.length; i++)
      this._set.delete(this.notes[i]);
    this._set.add(note);
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

  addOpenHandler (cb) {
    this._openHandlers.push(cb);
  }
}

angular.module('dyanote').service('openNotes', openNotes);
