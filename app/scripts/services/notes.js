
'use strict';

angular.module('dyanote')

// TODO: Split this class since it's getting far too big.

// notes service manages all notes.
// It is responsible to enforce coherence in the note set.
.service('notes', function ($log, $rootScope, $timeout, $q, noteResource) {
  
  // All our notes
  var notes = {};
  var rootNote, archiveNote;
  var notesCounter;
  var thisService = this;


  // Load all notes
  this.loadAll = function () {
    return noteResource.getAll().then(function (jsons) {
      // Add notes.
      for (var i = 0; i < jsons.length; i++) {
        var note = new Note(jsons[i]);
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
  }

  // Get the one to rule them all.
  this.getRoot = function () {
    return rootNote;
  }

  // Get the archive note (The trash).
  this.getArchive = function () {
    return archiveNote;
  }

  // Returns the note with the given id or throws an exception.
  this.getById = function (id) {
    if (id in notes)
      return notes[id];
    else
      throw "Note " + id + " not found.";
  }

  // Create a new note with the given parent, title and body.
  // Returns a Note with a temporary id (which will get updated
  // once the server responds).
  this.newNote = function (parent, title, body) {
    var json = {
      title: title,
      body: body,
      parent: parent.url
    };
    // Create new fake Note
    var note = new Note(json, true);
    // Add note to the dictionary using its fake id.
    notes[note.id] = note;
    notesCounter++;

    noteResource.post(json).then(function (json) {
      // Update note to use real server data.
      note._json.id = json.id;
      note._json.url = json.url;
      notes[note.id] = note;
      thisService.NotesCoherenceTools.removeFakeLinks(note.parent);
    });
    return note;
  }

  // Get number of notes.
  this.count = function () {
    return notesCounter;
  }

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
      var note = thisService.getById(key);
      // Search for text in note.
      if (regex.test(note.title) || regex.test(note.body)) {
        if (!(note in results))
          results.push(note);
      }

      $timeout(search_next, 0);
    }

    $timeout(search_next, 0);

    return {
      promise: searchDeferred.promise,
      results: results
    }
  }

  // NotesCoherenceTools is a set of utility functions useful to
  // enforce some constraints on our notes.
  this.NotesCoherenceTools = {

    // Replace fake links with real links.
    removeFakeLinks: function (note) {
      var containsFakeLinks = note.body.indexOf('templink') != -1;
      while (containsFakeLinks) {
        var match = note.body.match(/https:\/\/dyanote\.com\/templink\/(\d+)\//);
        var fakeId = match[1];
        var fakeUrl = match[0];
        var realUrl = thisService.getById(fakeId).url;
        if (realUrl.indexOf('templink') == -1) {
          note.body = note.body.replace(fakeUrl, realUrl);
          $log.info("removeFakeLinks: replaced " + fakeUrl + " with " + realUrl);

          containsFakeLinks = note.body.indexOf('templink') != -1;
        } else {
          break;
        }
      }
    },

    // Remove links to archived notes.
    removeDeadLinks: function (note) {
      // Search all dead links.
      var deadLinks = [];
      var body = note.body;
      var regex = /<a href="[^"]+\/(\d+)\/">[^<]*<\/a>/g;
      var match;
      while ((match = regex.exec(body)) !== null)
      {
        if (thisService.getById(match[1]).parent !== note) {
          deadLinks.push(match[0]);
        }
      }
      for (var i = 0; i < deadLinks.length; i++) {
        $log.info("Removing dead link " + deadLinks[i] + " in note " + note.id);
        body = body.replace(deadLinks[i], '');
      };
      note.body = body;
    }
  }

  //
  // The Note class.
  //
  var Note = function () {

    // The constructor takes as input the server representation of the note.
    var Note = function (json, isFake) {
      this._json = json;
      this._private = {};

      if (isFake) {
        var fakeId = Date.now();
        this._private.fakeId = fakeId;
        this._private.fakeUrl = 'https://dyanote.com/templink/' + fakeId + '/';
      }
    }

    // Id
    Object.defineProperty(Note.prototype, 'id', {
      // Get the note id or fake id
      // (A note has a fake id until the server acknowledges its creation.)
      get: function () {
        return this._json.id || this._private.fakeId;
      }
    });

    // Url
    Object.defineProperty(Note.prototype, 'url', {
      get: function () {
        return this._json.url || this._private.fakeUrl;
      }
    });

    // Title
    Object.defineProperty(Note.prototype, 'title', {
      get: function () {
        return this._json.title;
      },
      set: function (title) {
        if (this._json.title == title) return;
        this._json.title = title;
        save(this);
      }
    });

    // Body
    Object.defineProperty(Note.prototype, 'body', {
      get: function () {
        return this._json.body;
      },
      set: function (body) {
        if (this._json.body == body) return;
        this._json.body = body;
        save(this);
      }
    });

    // Parent
    Object.defineProperty(Note.prototype, 'parent', {
      get: function () {
        if (this.isRoot()) throw ("Root note has no parent");
        if (this.isArchive()) throw ("Archive note has no parent");
        var parentId = this._json.parent.match(/.*\/(\d+)\/$/)[1];
        return thisService.getById(parentId);
      },
      set: function (newParent) {
        var oldParent = this.parent;
        this._json.parent = newParent.url;
        thisService.NotesCoherenceTools.removeDeadLinks(oldParent);
        return save(this);
      }
    });

    // Archive note
    Note.prototype.archive = function () {
      $log.info('Archiving note ' + this._json.id);
      this.parent = archiveNote;
    };

    // Return true if this is the Root note.
    Note.prototype.isRoot = function () {
      return this._json.flags && this._json.flags.indexOf("root") != -1;
    };

    // Return true if this is the Archive note
    Note.prototype.isArchive = function () {
      return this._json.flags && this._json.flags.indexOf("archive") != -1;
    };


    // Save note (eventually).
    var save = function (note) {
      if (note._private.dirty)
        return;
      note._private.dirty = true;
      $timeout(function () {
        note._private.dirty = false;
        noteResource.put(note._json);
      }, 4000);
    }

    return Note;
  } ();
})
