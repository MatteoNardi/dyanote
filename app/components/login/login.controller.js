
function LoginController (backend, $scope, $location, $timeout, $anchorScroll) {

  $scope.$watch(() => backend.isAuthenticated(), (isAuthenticated, wasAuthenticated) => {
    console.info('backend.isAuthenticated', isAuthenticated, wasAuthenticated);
    if (isAuthenticated) {
      $timeout(function () {
        $location.path('/notes');
      });
    }
  });

  $scope.scrollTo = function(id) {
    $location.hash(id);
    $anchorScroll();
};

  this.login = _ => backend.login();
}

angular.module('dyanote').controller('LoginController', LoginController);
