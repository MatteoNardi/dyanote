'use strict';

angular.module('dyanote')

// notesFactory is responsible for converting notes from
// their json representation to the more powerfull Note objects.
// In this service we define the Note class, used all over Dyante.
.service('notesFactory', function ($log, $timeout, $injector, noteResource) {

  // Return a new Note object created from the json of our REST service.
  this.newNote = function (json) {
    return new Note(json, false);
  }

  // Create a new note with a temporary id and url.
  this.newTempNote = function (json) {
    return new Note(json, true);
  }


  // The Note constructor takes as input the server representation of the note.
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
      // TODO: remove this dependency!
      var notes = $injector.get('notes');
      return notes.getById(parentId);
    },
    set: function (newParent) {
      var oldParent = this.parent;
      this._json.parent = newParent.url;
      // TODO: remove this dependency!
      var notesCoherenceTools = $injector.get('notesCoherenceTools');
      notesCoherenceTools.removeDeadLinks(oldParent);
      return save(this);
    }
  });

  Note.prototype.hasParent = function () {
    return !this.isRoot() && !this.isArchive();
  };

  // Archive note
  Note.prototype.archive = function () {
    $log.info('Archiving note ' + this._json.id);
    // TODO: remove this dependency!
    var notes = $injector.get('notes');
    this.parent = notes.getArchive();
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
});
