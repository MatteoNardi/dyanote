
// The controller for registering new users.
class RegisterController {
  constructor ($log, $location, notifications, auth) {
    this.auth = auth;
    this.$log = $log;
    this.notifications = notifications;
    this.$location = $location;
  }

  canActivate () {
    if (this.auth.isAuthenticated() || this.auth.loadFromSettings()) {
      this.$log.info('RegisterController canActivate: false (User is already logged in)');
      this.$location.path('/notes');
      return false;
    }
    this.$log.info('RegisterController canActivate: true');
    return true;
  }

  activate () {
    this.form = {
      email: '',
      password: '',
      passwordCheck: '',

      isRegistering: false,
      alreadyInUse: false,
      mismatch: false,
      failure: false
    }
  }

  register (registerForm, passwordField) {
    var {email, password, passwordCheck} = this.form;

    if (password != passwordCheck) {
      this.form.mismatch = true;
      return;
    }

    this.form.isRegistering = true;
    this.form.alreadyInUse = false;
    this.form.mismatch = false;
    this.form.failure = false;

    this.auth.register(email, password).then(() => {
      this.$log.info("Registration successful");
      this.$location.path('/login');
      this.notifications.success('Registration successful: check your email');
      this.form.isRegistering = false;
    }, (response) => {
      this.form.isRegistering = false;
      if (response.status == 409 /*CONFLICT*/)
        this.form.alreadyInUse = true;
      else {
        this.$log.error('Sending mail failed');
        this.form.failure = true;
      }
    });
  }
}

angular.module('dyanote').controller('RegisterController', RegisterController);
