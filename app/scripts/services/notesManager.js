'use strict';

angular.module('dyanote')

// notesManager is responsible for loading notes on startup,
// creating and saving notes.  
.service('notesManager', function ($log, $timeout, $q, auth, openNotes, noteResource, notesFactory, notesGraph, notesCoherenceTools) {
  var me = this;

  function init () {
    if (auth.isAuthenticated)
      me.loadAll();
    auth.onLogin.push(me.loadAll);
  }

  // Notes with unsaved changes.
  var dirtyNotes = {};

  // Load all notes
  this.loadAll = function () {
    return noteResource.getAll().then(function (jsons) {
      // Add notes.
      for (var i = 0; i < jsons.length; i++) {
        var note = notesFactory.newNote(jsons[i]);
        connectSignals(note);
      }

      // Make sure we have a Root and an Archive
      if (!notesGraph.getRoot())
        $log.error('Root note not found');
      if (!notesGraph.getArchive())
        $log.error('Archive note not found');

      $log.info("Notes loaded: " + notesGraph.count());
      openNotes.open(notesGraph.getRoot());
    });
  };

  function connectSignals (note) {
    note.changedSignal.addHandler(onNoteChanged);
    note.parentChangedSignal.addHandler(onNoteParentChanged);
    note.titleChangedSignal.addHandler(onNoteTitleChanged);
  }

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

  // When the parent of a note changes, we remove the dead links.
  function onNoteParentChanged (note, oldParent) {
    notesCoherenceTools.removeLink(oldParent, note.url);
  }

  // When the title of a note changes, we rename the links to it.
  function onNoteTitleChanged (note, oldTitle) {
    // Note might have no parent
    try {
      notesCoherenceTools.renameLink(note.parent, note, oldTitle);
    } catch (e) {
      $log.warn('Note has no parent: cant rename link');
    }
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
    connectSignals(note);

    noteResource.post(json).then(function (json) {
      // Update note to use real server data.
      var realUrl = json.url;
      var fakeUrl = note.url;
      note.finalize(json.id, realUrl)
      notesCoherenceTools.convertLink(note.parent, fakeUrl, realUrl);
    });
    return note;
  };

  init();
})
