'use strict';

angular.module('dyanote')
  .controller('LogoutCtrl', function ($scope, $log, $location, auth) {
    auth.logout();
    $log.info('Logout');
    $location.path('/login');
  });
