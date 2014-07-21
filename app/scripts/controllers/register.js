'use strict';

angular.module('dyanote')

// The controller for registering new users.
.controller('RegisterCtrl', function ($scope, $log, auth) {

  var form = {
    email: '',
    password: '',
    passwordCheck: '',

    emailErrorMessage: '',
    passwordErrorMessage: '',
    passwordCheckErrorMessage: '',

    successMessage: '',
    errorMessage: ''
  }
  $scope.form = form;

  $scope.register = function () {
    if (form.email == '')
      form.emailErrorMessage = "Email address is required";
    else if (! /\S+@\S+\.\S+/.test(form.email))
      form.emailErrorMessage = "This is not a valid mail address";
    else if (form.password.length < 4)
      form.passwordErrorMessage = "Password is too short";
    else if (form.password != form.passwordCheck)
      form.passwordCheckErrorMessage = 'Passwords are different';
    else {
      form.emailErrorMessage = '';
      form.emailCheckErrorMessage = '';

      auth.register(form.email, form.password).success(function() {
        form.successMessage = 'You received an activation mail.';
      }).error(function (data, code) {
        if (code == 409 /*CONFLICT*/) {
          form.emailErrorMessage = 'This mail address is already in use';
        } else {
          $log.error('Sending mail failed');
          form.errorMessage = 'Registration failed.';
        }
      });
    }
  }
});
