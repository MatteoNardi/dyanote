// This controller allows only logged in  logged in users.
function AuthenticatedController ($router, $location, $timeout, backend, notesManager) {
  $router.config([
    { path: '/', redirectTo: '/view'},

    { path: '/view', component: 'notes'},
    { path: '/trash', component: 'trash'},
    { path: '/dyagraph', component: 'dyagraph'},
    { path: '/search', component: 'search'}
  ]);

  this.activate = _ => {
    if (!backend.isAuthenticated()) {
      $timeout(function () {
        $location.path('/login');
      });
    }
  };
}

angular.module('dyanote').controller('AuthenticatedController', AuthenticatedController);
