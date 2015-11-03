
function LoginController (backend, $scope, $location, $timeout) {

  $scope.$watch(() => backend.isAuthenticated(), (isAuthenticated, wasAuthenticated) => {
    console.info('backend.isAuthenticated', isAuthenticated, wasAuthenticated);
    if (isAuthenticated) {
      $timeout(function () {
        $location.path('/notes');
      });
    }
  });

  this.login = _ => backend.login();
}

angular.module('dyanote').controller('LoginController', LoginController);
