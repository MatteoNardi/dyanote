'use strict';

angular.module('dyanote')

// The main controller which bootstraps Dyanote.
// It stores on its scope some global variables shared by all
// controllers.
.controller('MainCtrl', function ($scope, auth, notesManager) {
  // Global variables
  // FIX THIS
  $scope.app = {
    user: {
      isAuthenticated: auth.isAuthenticated(),
      email: auth.getEmail()
    },
    loading: true,
    currentNote: undefined
  };
});
