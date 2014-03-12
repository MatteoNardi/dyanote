'use strict';

angular.module('dyanote')

// notesGraph is the container of all the notes.
// It allows to get special notes (Root and Archive),
// and search notes by Id or text.
.service('notesGraph', function () {

  // All our notes
  var notes = {};
  // Root  and Archive notes.
  var rootNote, archiveNote;
  // Number of notes.
  var notesCounter = 0;

  // Add a new note to the graph.
  this.addNote  = function (note) {
    if (note.id in notes)
      throw 'A note with the given Id already exists';
    notes[note.id] = note;
    notesCounter++;

    if (note.isRoot()) {
      if (rootNote != undefined)
        throw 'Root note already exists';
      rootNote = note;
    }
    
    if (note.isArchive()) {
      if (archiveNote != undefined)
        throw 'Root note already exists';
      archiveNote = note;
    }

    if (note.hasTemporaryId()) {
      note.gotFinalIdSignal.addHandler(function () {
        notes[note.id] = note;
      });
    }
  }

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

    var notesGraph = this;
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
      var note = notesGraph.getById(key);
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
});
