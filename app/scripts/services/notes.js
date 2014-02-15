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

    // Upload changes when body or title gets updated.
    // TODO: this causes far to many HTTP requests, we should
    // find a better approach.
    $rootScope.$watch(function () { return json.body; }, function(newBody, oldBody) {
      if (newBody !== oldBody) noteResource.put(json);
    });

    $rootScope.$watch(function () { return json.title; }, function(newTitle, oldTitle) {
      if (newTitle !== oldTitle) noteResource.put(json);
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
      fakeUrl: 'https://localhost/' + fakeId + '/' 
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
})
