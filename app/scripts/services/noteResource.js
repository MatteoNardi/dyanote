'use strict';

angular.module('dyanote')

// noteResource handles comunication with the REST service.
// It offers a CRUD interface and it doesn't keep track of notes.
.service('noteResource', function ($http, $q, $log, auth, SERVER_CONFIG) {

  // Load all notes from server with the currently logged in user.
  // Returns a promise resolved with the note list.
  this.getAll = function () {
    if(!auth.isAuthenticated())
      return $q.reject("User is not logged in");

    var url = SERVER_CONFIG.apiUrl + 'users/' + auth.getEmail() + '/pages/';
    return $http.get(url).then(function (result) {
      return result.data;
    });
  }

  // Create note.
  // Returns a promise resolved with the saved note
  // (which will contain a valid id)
  this.post = function (note) {
    var url = SERVER_CONFIG.apiUrl + 'users/' + auth.getEmail() + '/pages/';
    return $http.post(url, note).then(function (result) {
      return result.data;
    });
  }

  // Update note.
  this.put = function (note) {
    $log.info('Saving note ' + note.id + ": " + note.body);
    return $http.put(note.url, note);
  }
});
