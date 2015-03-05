angular.module('dyanote')
  .controller('LoginController', ['$scope', '$log', '$location', 'auth', LoginController]);

class LoginController {
  constructor ($scope, $log, $location, auth) {
    this.auth = auth;
    this.$log = $log;
    this.$location = $location;
  }

  activate () {
    this.form = {
      email: '',
      password: '',
      emailErrorMessage: '',
      passwordErrorMessage: '',
      errorMessage: '',
      isLoggingIn: false,
      remember: false
    }
  }

  canActivate () {
    if (this.auth.isAuthenticated() || this.auth.loadFromSettings()) {
      console.warn('LoginController canActivate: false (User is already logged in)');
      this.$location.path('/notes');
      return false;
    }
    console.info('LoginController canActivate: true');
    return true;
  }

  login () {
    console.log('login')
    var form = this.form;
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

    this.auth.login(form.email, form.password, form.remember).then(function (response) {
      this.$log.info("Logged in");
      form.isLoggingIn = false;
      this.$location.path('/notes');
    }.bind(this), function (response) {
      form.isLoggingIn = false;
      form.errorMessage = "Wrong username or password";
    });
  }
}
