
'use strict';

angular.module('dyanote')

// notes service manages all notes.
.service('notes', function ($log, $rootScope, $timeout, $q, noteResource, notesFactory, notesCoherenceTools) {
  
  // All our notes
  var notes = {};
  var rootNote, archiveNote;
  var notesCounter;

  // Load all notes
  this.loadAll = function () {
    return noteResource.getAll().then(function (jsons) {
      // Add notes.
      for (var i = 0; i < jsons.length; i++) {
        var note = notesFactory.newNote(jsons[i]);
        notes[note.id] = note;
        if (note.isRoot())
          rootNote = note;
        if (note.isArchive())
          archiveNote = note;
      }

      // Make sure we have a Root and an Archive
      if (!rootNote)
        $log.error('Root note not found');
      if (!archiveNote)
        $log.error('Archive note not found');

      // Count notes.
      notesCounter = 0;
      for (var key in notes) {
          if (notes.hasOwnProperty(key)) notesCounter++;
      }
    });
  };

  // Clear everything (For example after logout)
  this.clear = function () {
    notes = {};
    rootNote = undefined;
    archiveNote = undefined;
    notesCounter = 0;
  };

  // Get the one to rule them all.
  this.getRoot = function () {
    return rootNote;
  };

  // Get the archive note (The trash).
  this.getArchive = function () {
    return archiveNote;
  };

  // Returns the note with the given id or throws an exception.
  this.getById = function (id) {
    if (id in notes)
      return notes[id];
    else
      throw "Note " + id + " not found.";
  };

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
    // Add note to the dictionary using its fake id.
    notes[note.id] = note;
    notesCounter++;

    noteResource.post(json).then(function (json) {
      // Update note to use real server data.
      note._json.id = json.id;
      note._json.url = json.url;
      notes[note.id] = note;
      notesCoherenceTools.removeFakeLinks(note.parent);
    });
    return note;
  };

  // Get number of notes.
  this.count = function () {
    return notesCounter;
  };

  // Search for notes.
  // Since we don't want to freeze UI, this runs "asynchronously".
  // Returns {}
  // {
  //    results: [list of notes]
  //    promise: $q promise resolved when search is finished
  // }
  // A new search cancels every other running search. 
  var searchDeferred;
  this.search = function (text) {
    // If a search is running, cancel it.
    if (searchDeferred)
      searchDeferred.reject('New search requested');

    var getById = this.getById;
    var regex = new RegExp(text, 'i');
    var deferred = searchDeferred = $q.defer();
    var results = [];
    var keys = Object.keys(notes);
    var running = true;
    deferred.promise.catch(function () {
      running = false;
    });

    var search_next = function () {
      if (!running) return;
      if (keys.length == 0) return deferred.resolve();

      var key = keys.pop();
      var note = getById(key);
      // Search for text in note.
      if (!(note in results)) {
        // Notes matching in title have precedence.
        if (regex.test(note.title))
          results.unshift(note);
        else if (regex.test(note.body))
          results.push(note);
      }

      $timeout(search_next, 0);
    }

    $timeout(search_next, 0);

    return {
      promise: searchDeferred.promise,
      results: results
    }
  };
})
