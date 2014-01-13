'use strict';

angular.module('dyanote')
  .controller('MainCtrl', function ($scope) {
    $scope.isAuthenticated = auth.isAuthenticated;
    $scope.username = "Matteo Nardi";
  });
