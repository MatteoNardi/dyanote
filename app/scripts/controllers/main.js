'use strict';

angular.module('dyanote')

.controller('MainCtrl', function ($scope, auth) {
  $scope.isAuthenticated = auth.isAuthenticated;
  $scope.username = auth.getEmail();
});
