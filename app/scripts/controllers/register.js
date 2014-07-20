'use strict';

angular.module('dyanote')

.controller('RegisterCtrl', function ($scope, auth) {

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
    if (form.password != form.passwordCheck)
      form.passwordCheckErrorMessage = 'Passwords are different';
    else
      auth.register(form.email, form.password);
  }
});
