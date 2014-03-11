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

    this.changedSignal = new Signal();
    this.parentChangedSignal = new Signal();
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
      this.changedSignal.fire(this);
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
      this.changedSignal.fire(this);
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
      this.changedSignal.fire(this);
      this.parentChangedSignal.fire(this, oldParent);
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


  // A simple implementation of the Observer pattern.
  // This is used for note signals.
  function Signal () {
    this.listeners = [];
  }

  Signal.prototype.addHandler = function (fn) {
    this.listeners.push(fn);
  };

  Signal.prototype.removeHandler = function (fn) {
    for (var i in this.listeners)
      if (this.listeners[i] ==== fn)
        this.listeners.splice(i, 1);
  };

  Signal.prototype.fire = function (arg1, arg2) {
    var length = this.listeners.length;
    for(var i = 0; i < length; i++){
      this.listeners[i](arg1, arg2);
    }
  };
});
