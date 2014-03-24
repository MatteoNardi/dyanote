'use strict';

angular.module('dyanote')

// notesManager is responsible for loading notes on startup,
// creating and saving notes.  
.service('notesManager', function ($log, $rootScope, $timeout, $q, noteResource, notesFactory, notesGraph, notesCoherenceTools) {
  
  // Notes with unsaved changes.
  var dirtyNotes = {};

  // Load all notes
  this.loadAll = function () {
    return noteResource.getAll().then(function (jsons) {
      // Add notes.
      for (var i = 0; i < jsons.length; i++) {
        var note = notesFactory.newNote(jsons[i]);
        note.changedSignal.addHandler(onNoteChanged);
        note.parentChangedSignal.addHandler(onNoteParentChanged);
      }

      // Make sure we have a Root and an Archive
      if (!notesGraph.getRoot())
        $log.error('Root note not found');
      if (!notesGraph.getArchive())
        $log.error('Archive note not found');
    });
  };

  // Handler for noteChanged signal.
  // We save dirty notes to server every 4 seconds.
  function onNoteChanged (note) {
    var id = note.id;
    if (id in dirtyNotes)
      return;
    dirtyNotes[id] = note;
    $timeout(function () {
      delete dirtyNotes[id];
      noteResource.put(note._json);
    }, 4000);
  }

  // Handler for noteParentChanged signal.
  function onNoteParentChanged (note, oldParent) {
    notesCoherenceTools.removeDeadLinks(oldParent);
  }

  // Create a new note with the given parent, title and body.
  // Returns a Note with a temporary id (which will get updated
  // once the server responds).
  this.newNote = function (parent, title, body) {
    if (!title || title == '')
      throw 'Title is required';

    var json = {
      title: title,
      body: body,
      parent: parent.url
    };
    // Create new fake Note
    var note = notesFactory.newTempNote(json);
    note.changedSignal.addHandler(onNoteChanged);
    note.parentChangedSignal.addHandler(onParentChanged);

    noteResource.post(json).then(function (json) {
      // Update note to use real server data.
      note.finalize(json.id, json.url)
      notesCoherenceTools.removeFakeLinks(note.parent);
    });
    return note;
  };
})
