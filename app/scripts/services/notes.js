'use strict';

angular.module('dyanote')

// notes handles comunication with the REST service and notes handling.
.service('notes', function ($resource, $q, auth, SERVER_CONFIG) {
  
  // All our notes
  var notes = {};
  var rootNoteId;

  // $resource wrapper around our REST APIs.
  var NoteResource;

  // Load all notes from server with the currently logged in user.
  this.loadAll = function () {
    NoteResource = $resource(SERVER_CONFIG.apiUrl + 'users/:user/pages/:id',
                            { user: auth.getEmail() });
    var deferred = $q.defer();
    NoteResource.query(function (result) {
      for (var i = 0; i < result.length; i++) {
        notes[result[i].id] = result[i];
        if (result[i].flags.indexOf("root") != -1)
          rootNoteId = result[i].id;
        rootNoteId
      }
      deferred.resolve()
    });
    return deferred.promise;
  }

  // Get the one to rule them all.
  this.getRoot = function () {
    return notes[rootNoteId];
  }

  // Get a note given its id.
  this.getById = function (id) {
    return notes[id];
  }

  // Get number of notes.
  this.count = function () {
    var size = 0, key;
    for (key in notes) {
        if (notes.hasOwnProperty(key)) size++;
    }
    return size;
  }
});
