'use strict';

angular.module('dyanote')

.controller('LogoutCtrl', function ($scope, $log, $location, auth, notesGraph) {
  auth.logout();
  notesGraph.clear();
  $log.info('Logout');
  $location.path('/login');
});
