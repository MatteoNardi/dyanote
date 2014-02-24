'use strict';

angular.module('dyanote')

.controller('LoginCtrl', function ($scope, $log, $location, auth) {
  if (auth.loadFromSettings()) {
    $log.warn('User is already logged in');
    $location.path('/notes');
  }

  $scope.email = "";
  $scope.password = "";
  $scope.emailErrorMessage = "";
  $scope.passwordErrorMessage = "";
  $scope.errorMessage = "";
  $scope.isLoggingIn = false;
  $scope.remember = false;

  $scope.login = function () {
    if ($scope.email == "")
      $scope.emailErrorMessage = "Email address is required";
    else if (! /\S+@\S+\.\S+/.test($scope.email))
      $scope.emailErrorMessage = "This is not a valid mail address";
    else
      $scope.emailErrorMessage = "";

    if ($scope.password == "")
      $scope.passwordErrorMessage = "Password is required";
    else if ($scope.password.length < 4)
      $scope.passwordErrorMessage = "Password is too short";
    else
      $scope.passwordErrorMessage = "";

    if($scope.emailErrorMessage != "" || $scope.passwordErrorMessage != "")
      return;

    $scope.isLoggingIn = true;
    $scope.errorMessage = "";

    auth.login($scope.email, $scope.password, $scope.remember).then(function (response) {
      $log.info("Logged in");
      $scope.isLoggingIn = false;
      $location.path('/notes');
    }, function (response) {
      $scope.errorMessage = "Wrong username or password";
    });
  }
});
