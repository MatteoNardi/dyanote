
class LoginController {
  constructor (backend, $scope, $location) {
    this.backend = backend;

    $scope.$watch(() => backend.isAuthenticated(), (a, isAuthenticated) => {
      if (isAuthenticated)
        $location.path('/notes');
    });
  }

  canActivate () {
    // if (this.backend.isAuthenticated()) {
    //   this.$location.path('/notes');
    //   return false;
    // }
    return !this.backend.isAuthenticated();
  }

  login (loginForm, passwordField) {
    console.info('login()');
    this.backend.login();
  }
}

angular.module('dyanote').controller('LoginController', LoginController);
