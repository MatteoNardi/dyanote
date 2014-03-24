'use strict';

angular.module('dyanote')

// notesFactory is responsible for converting notes from
// their json representation to the more powerfull Note objects.
// In this service we define the Note class, used all over Dyante.
.service('notesFactory', function ($log, $timeout, notesGraph) {

  // Return a new Note object created from the json of our REST service.
  this.newNote = function (json) {
    var note = new Note(json, false);
    notesGraph.add(note);
    return note;
  }

  // Create a new note with a temporary id and url.
  this.newTempNote = function (json) {
    var note = new Note(json, true);
    notesGraph.add(note);
    return note;
  }


  // The Note constructor takes as input the server representation of the note.
  var Note = function (json, isTemp) {
    // Todo: remove _json
    this._json = json;
    this._private = {};

    this._id = json.id;
    this._url = json.url;
    
    if (isTemp) {
      var tempId = Date.now();
      this._tempId = tempId;
      this._tempUrl = 'https://dyanote.com/templink/' + tempId + '/';
    }

    this.changedSignal = new Signal();
    this.parentChangedSignal = new Signal();
    this.gotFinalIdSignal = new Signal();
  }

  // Id
  Object.defineProperty(Note.prototype, 'id', {
    // Get the note id or fake id
    // (A note has a fake id until the server acknowledges its creation.)
    get: function () {
      if (this._json.id === undefined)
        return this._tempId;
      else
        return this._json.id;
    }
  });

  // Returns true if the note has not been saved on the server yet
  // (thus it still has a temporary Id and Url)
  Note.prototype.hasTemporaryId = function () {
    return !this._json.id;
  };

  Note.prototype.finalize = function (realId, realUrl) {
    if (!this.hasTemporaryId())
      throw 'This note doesnt have temporary id and url'; 
    this._json.id = realId;
    this._json.url = realUrl;
    this.gotFinalIdSignal.fire();
  };

  // Url
  Object.defineProperty(Note.prototype, 'url', {
    get: function () {
      return this._json.url || this._tempUrl;
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
      return notesGraph.getById(parentId);
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
    this.parent = notesGraph.getArchive();
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
      if (this.listeners[i] === fn)
        this.listeners.splice(i, 1);
  };

  Signal.prototype.fire = function (arg1, arg2) {
    var length = this.listeners.length;
    for(var i = 0; i < length; i++){
      this.listeners[i](arg1, arg2);
    }
  };
});
