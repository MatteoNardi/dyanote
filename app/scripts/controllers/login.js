'use strict';

angular.module('dyanote')

.controller('LoginCtrl', function ($scope, $log, $location, auth) {
  if (auth.loadFromSettings()) {
    $log.warn('User is already logged in');
    $location.path('/notes');
  }

  var form = {
    email: '',
    password: '',
    emailErrorMessage: '',
    passwordErrorMessage: '',
    errorMessage: '',
    isLoggingIn: false,
    remember: false
  }

  $scope.form = form;

  $scope.login = function () {
    if (form.email == "")
      form.emailErrorMessage = "Email address is required";
    else if (! /\S+@\S+\.\S+/.test(form.email))
      form.emailErrorMessage = "This is not a valid mail address";
    else
      form.emailErrorMessage = "";

    if (form.password == "")
      form.passwordErrorMessage = "Password is required";
    else if (form.password.length < 4)
      form.passwordErrorMessage = "Password is too short";
    else
      form.passwordErrorMessage = "";

    if(form.emailErrorMessage != "" || form.passwordErrorMessage != "")
      return;

    form.isLoggingIn = true;
    form.errorMessage = "";

    auth.login(form.email, form.password, form.remember).then(function (response) {
      $log.info("Logged in");
      form.isLoggingIn = false;
      $location.path('/notes');
    }, function (response) {
      form.isLoggingIn = false;
      form.errorMessage = "Wrong username or password";
    });
  }
});
