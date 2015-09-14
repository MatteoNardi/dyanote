
function LoginController (backend, $scope, $location, $timeout) {

  $scope.$watch(() => backend.isAuthenticated(), (a, isAuthenticated) => {
    if (isAuthenticated) {
      $timeout(function () {
        $location.path('/notes');
      });
    }
  });

  this.login = _ => backend.login();
}

angular.module('dyanote').controller('LoginController', LoginController);
