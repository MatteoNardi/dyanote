'use strict';

angular.module('dyanote')

// notes service manages all notes.
// It is responsible to enforce coherence in the note set.
.service('notes', function ($log, $rootScope, noteResource) {
  
  // All our notes
  var notes = {};
  var rootNote, archiveNote;
  var notesCounter;
  var thisService = this;

  // The Note class.
  // The constructor takes as input the server representation of the note.
  var Note = function (json) {
    var thisNote = this;
    this._json = json;

    this.getBody = function () {
      return json.body;
    }

    this.getTitle = function () {
      return json.title;
    }

    this.setBody = function (body) {
      json.body = body;
    }

    this.setTitle = function (title) {
      json.title = title;
    }

    // Get the note id or fake id
    // (A note has a fake id until the server acknowledges its creation.)
    this.getId = function () {
      return json.id || json.fakeId;
    };

    this.getUrl = function () {
      return json.url || json.fakeUrl;
    };

    this.isRoot = function () {
      return json.flags && json.flags.indexOf("root") != -1;
    };

    this.isArchive = function () {
      return json.flags && json.flags.indexOf("archive") != -1;
    };

    this.getParent = function () {
      if (this.isRoot()) throw ("Root note has no parent");
      if (this.isArchive()) throw ("Archive note has no parent");
      var parentId = json.parent.match(/.*\/(\d+)\/$/)[1];
      return thisService.getById(parentId);
    };

    this.setParent = function (newParent) {
      json.parent = newParent.getUrl();
      return noteResource.put(json);
      // TODO: make sure the new parent contains a link to this note.
    };

    this.archive = function () {
      this.setParent(archiveNote);
    };

    // Save note after checking its coherence.
    // This function is private: we decide when to save.
    var save = function () {
      thisService.NotesCoherenceTools.removeFakeLinks(thisNote);
      noteResource.put(json);
    }

    // Upload changes when body or title gets updated.
    // TODO: this causes far to many HTTP requests
    $rootScope.$watch(function () { return json.body; }, function(newBody, oldBody) {
      if (newBody !== oldBody)
        save();
    });

    $rootScope.$watch(function () { return json.title; }, function(newTitle, oldTitle) {
      if (newTitle !== oldTitle)
        save();
    });
  }

  // Load all notes
  this.loadAll = function () {
    return noteResource.getAll().then(function (jsons) {
      // Add notes.
      for (var i = 0; i < jsons.length; i++) {
        var note = new Note(jsons[i]);
        notes[note.getId()] = note;
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
    var fakeId = Date.now();
    var json = {
      title: title,
      body: body,
      parent: parent.getUrl(),
      fakeId: fakeId,
      fakeUrl: 'https://dyanote.com/templink/' + fakeId + '/' 
    };
    // Create new Note with the temporary json
    var note = new Note(json);
    // Add note to the dictionary using its fake id.
    notes[note.getId()] = note;
    notesCounter++;

    noteResource.post(json).then(function (json) {
      // Update note to use real server data.
      note._json.id = json.id;
      note._json.url = json.url;
      notes[note.getId()] = note;
    });
    return note;
  }

  // Get number of notes.
  this.count = function () {
    return notesCounter;
  }

  // NotesCoherenceTools is a set of utility functions useful to
  // enforce some constraints on our notes.
  this.NotesCoherenceTools = {

    // Replace fake links with real links.
    removeFakeLinks: function (note) {
      var containsFakeLinks = note.getBody().indexOf('templink') != -1;
      while (containsFakeLinks) {
        var match = note.getBody().match(/https:\/\/dyanote\.com\/templink\/(\d+)\//)
        var fakeId = match[1];
        var fakeUrl = match[0];
        var realUrl = thisService.getById(fakeId).getUrl();
        if (realUrl.indexOf('templink') == -1) {
          note.setBody(note.getBody().replace(fakeUrl, realUrl));
          $log.info("removeFakeLinks: replaced " + fakeUrl + " with " + realUrl);

          containsFakeLinks = note.getBody().indexOf('templink') != -1;
        } else {
          break;
        }
      }
    }
  }
})
