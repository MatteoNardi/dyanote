'use strict';

angular.module('dyanote')

// notes handles comunication with the REST service and notes handling.
.service('notes', function ($log, noteResource) {
  
  // All our notes
  var notes = {};
  var rootNoteId,
    archiveNoteId;


  // Load all notes
  this.loadAll = function () {
    return noteResource.getAll().then(function (noteList) {
      for (var i = 0; i < noteList.length; i++) {
        notes[noteList[i].id] = noteList[i];
        var flags = noteList[i].flags;
        if (flags && flags.indexOf("root") != -1)
          rootNoteId = noteList[i].id;
        if (flags && flags.indexOf("archive") != -1)
          archiveNoteId = noteList[i].id;
      }
    });
  }

  // Get the one to rule them all.
  this.getRoot = function () {
    return this.getById(rootNoteId);
  }

  // Get the archive note (The trash).
  this.getArchive = function () {
    return this.getById(archiveNoteId);
  }

  // Returns the note with the given id or throws an exception.
  this.getById = function (id) {
    if (id in notes)
      return notes[id];
    else
      throw "Note " + id + " not found.";
  }

  // Upload to server the note with the given id.
  this.uploadById = function (id) {
    var note = this.getById(id);
    return noteResource.put(note);
  }

  // Create a new note
  this.newNote = function (note) {
    return noteResource.post(note).then(function (note) {
      notes[note.id] = note;
      return note;
    });
  }

  // Archive note.
  this.archive = function (id) {
    this.changeParent(id, archiveNoteId);
  }

  // Change the parent of a note.
  this.changeParent = function (id, newParentId) {
    var note = this.getById(id),
      newParent = this.getById(newParentId);

    note.parentId = newParentId;
    note.parent = newParent.url;
    return noteResource.put(note);
    // TODO: make sure the new parent contains a link to this note.
  }

  // Get number of notes.
  this.count = function () {
    var size = 0, key;
    for (key in notes) {
        if (notes.hasOwnProperty(key)) size++;
    }
    return size;
  }
})
