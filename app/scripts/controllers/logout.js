'use strict';

angular.module('dyanote')
  .controller('LogoutCtrl', function ($scope, $log, $location, auth, notes) {
    auth.logout();
    notes.clear();
    $log.info('Logout');
    $location.path('/login');
  });
