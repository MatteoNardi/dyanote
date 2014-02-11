'use strict';

angular.module('dyanote')

// notes handles comunication with the REST service and notes handling.
.service('notes', function ($resource, $q, $log, auth, SERVER_CONFIG) {
  
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

    NoteResource = $resource(SERVER_CONFIG.apiUrl + 'users/:user/pages/:id',
                            {
                              user: auth.getEmail(),
                              id: '@id'
                            },
                            {
                              'update': { method:'PUT' }
                            });
    NoteResource.query(function (result) {
      for (var i = 0; i < result.length; i++) {
        notes[result[i].id] = result[i];
        var flags = result[i].flags;
        if (flags && flags.indexOf("root") != -1)
          rootNoteId = result[i].id;
        if (flags && flags.indexOf("archive") != -1)
          archiveNoteId = result[i].id;
      }
      deferred.resolve()
    });
    return deferred.promise;
  }

  // Get the one to rule them all.
  this.getRoot = function () {
    return notes[rootNoteId];
  }

  // Get the archive note (The trash).
  this.getArchive = function () {
    return notes[archiveNoteId];
  }

  // Get a note given its id.
  this.getById = function (id) {
    return notes[id];
  }

  // Upload to server the note with the given id.
  this.uploadById = function (id) {
    if (notes[id] == undefined) {
      $log.error('uploadById: No note with id ' + id);
      return;
    }
    // BUG: this updates our note resource too.
    // We don't want this because it can create loops.
    //notes[id].$update();
  }

  // Create a new note
  this.newNote = function (newNoteRequest) {
    var note = new NoteResource();
    note.title = newNoteRequest.title;
    note.body = newNoteRequest.body;
    note.parent = notes[newNoteRequest.parentId].url;
    return note.$save(function (note) {
      notes[note.id] = note;
    });
  }

  // Archive note.
  this.archive = function (id) {
    this.changeParent(id, archiveNoteId);
  }

  // Change the parent of a note.
  this.changeParent = function (id, newParentId) {
    if (!notes[id] || !notes[newParentId]) {
      $log.error('changeParent: notes not found.');
      return;
    }
    notes[id].parentId = newParentId;
    notes[id].parent = notes[newParentId].url;
    notes[id].$update();
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

// Intercept API requests without a trailing slash and add it. 
// Angular's $resource service is buggy and strips the ending slashes in urls.
// Our REST service needs it (it will return a 301, which breacks CORS)
.service('missingSlashInterceptor', function () {
  this.request = function (config) {
    var url = config.url
    if (url[url.length -1] != '/' && url.indexOf('/api/') != -1)
      config.url += '/';
    return config;
  };
})

.config(function($httpProvider) {
  $httpProvider.interceptors.push('missingSlashInterceptor');
});
