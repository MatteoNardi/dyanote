'use strict';

angular.module('dyanote')

.controller('SplashScreenCtrl', function ($scope, $http, $interval, SERVER_CONFIG) {
  $scope.loading = true;
  $scope.percentage = 0;

  var delay = 500;
  // Heroku takes 10 seconds to startup virtual machine
  var estimatedTime = 10000;
  var count = estimatedTime/delay;
  var interval = $interval(function () {
    $scope.percentage += 100/count;
  }, delay, count -1);

  function finish () {
    $scope.loading = false;
    $scope.percentage = 1;
    $interval.cancel(interval);
  }

  $http.get(SERVER_CONFIG.apiUrl).success(function() {
    finish();
  }).error(function() {
    finish();
  });
});