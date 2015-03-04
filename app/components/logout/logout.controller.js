'use strict';

angular.module('dyanote')

.controller('LogoutController', function ($scope, $log, $location, auth, notesGraph) {
  auth.logout();
  notesGraph.clear();
  $log.info('Logout');
  $location.path('/login');
});
