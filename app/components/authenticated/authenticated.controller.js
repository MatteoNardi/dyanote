// This controller allows only logged in  logged in users.
class AuthenticatedController {
  constructor ($router, backend, notesManager) {
    this.backend = backend;

    $router.config([
      { path: '/', redirectTo: '/view'},

      { path: '/view', component: 'notes'},
      { path: '/archive', component: 'archive'},
      { path: '/dyagraph', component: 'dyagraph'},
      { path: '/search', component: 'search'}
    ]);
  }

  canActivate () {
    return this.backend.isAuthenticated();
  }
}

angular.module('dyanote').controller('AuthenticatedController', AuthenticatedController);
