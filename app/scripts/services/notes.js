'use strict';

angular.module('dyanote')

// notes handles comunication with the REST service and notes handling.
.service('notes', function ($http, $q, $log, auth, SERVER_CONFIG) {
  
  // All our notes
  var notes = {};
  var rootNoteId,
    archiveNoteId;

  // $resource wrapper around our REST APIs.
  var NoteResource;

  // Load all notes from server with the currently logged in user.
  this.loadAll = function () {
    var deferred = $q.defer();
    if(!auth.isAuthenticated()) {
      deferred.reject("User is not logged in");
      return deferred.promise
    }

    var url = SERVER_CONFIG.apiUrl + 'users/' + auth.getEmail() + '/pages/';
    return $http.get(url).success(function (result) {
      for (var i = 0; i < result.length; i++) {
        notes[result[i].id] = result[i];
        var flags = result[i].flags;
        if (flags && flags.indexOf("root") != -1)
          rootNoteId = result[i].id;
        if (flags && flags.indexOf("archive") != -1)
          archiveNoteId = result[i].id;
      }
    });
  }

  // Get the one to rule them all.
  this.getRoot = function () {
    return this.getById(rootNoteId);
  }

  // Get the archive note (The trash).
  this.getArchive = function () {
    return this.getById(archiveNoteId);
  }

  // Returns the note with the given id or throws an exception.
  this.getById = function (id) {
    if (id in notes)
      return notes[id];
    else
      throw "Note " + id + " not found.";
  }

  // Upload to server the note with the given id.
  this.uploadById = function (id) {
    var note = this.getById(id);
    return $http.put(note.url, note);
  }

  // Create a new note
  this.newNote = function (note) {
    var url = SERVER_CONFIG.apiUrl + 'users/' + auth.getEmail() + '/pages/';
    return $http.post(url, note).then(function (result) {
      var note = result.data;
      notes[note.id] = note;
      return note;
    });
  }

  // Archive note.
  this.archive = function (id) {
    this.changeParent(id, archiveNoteId);
  }

  // Change the parent of a note.
  this.changeParent = function (id, newParentId) {
    var note = this.getById(id),
      newParent = this.getById(newParentId);

    note.parentId = newParentId;
    note.parent = newParent.url;
    $http.put(note.url, note);
    // TODO: make sure the new parent contains a link to this note.
  }

  // Get number of notes.
  this.count = function () {
    var size = 0, key;
    for (key in notes) {
        if (notes.hasOwnProperty(key)) size++;
    }
    return size;
  }
})
