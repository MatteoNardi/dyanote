
class LoginController {
  constructor ($log, $location, auth) {
    this.auth = auth;
    this.$log = $log;
    this.$location = $location;
  }

  canActivate () {
    if (this.auth.isAuthenticated() || this.auth.loadFromSettings()) {
      this.$log.info('LoginController canActivate: false (User is already logged in)');
      this.$location.path('/notes');
      return false;
    }
    this.$log.info('LoginController canActivate: true');
    return true;
  }

  activate () {
    this.form = {
      email: '',
      password: '',
      remember: false,
      isLoggingIn: false
    }
  }

  login (loginForm) {
    var {email, password, remember} = this.form;

    this.form.isLoggingIn = true;

    this.auth.login(email, password, remember).then(() => {
      this.$log.info("Logged in");
      this.form.isLoggingIn = false;
      this.$location.path('/notes');
    }, () => {
      this.form.isLoggingIn = false;
      this.form.password.$setValidity('wrongPassword', false);
      // loginForm.$error.unshift({'wrongPassword': [loginForm] });
    });
  }
}

angular.module('dyanote').controller('LoginController', LoginController);
