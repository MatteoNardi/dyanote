
// This controller handles the routing logic of logged in users.
class AuthenticatedController {
  constructor ($router, $log, $q, auth, notesManager) {
    this.$log = $log;
    this.$q = $q;
    this.auth = auth;
    this.notesManager = notesManager;

    $router.config([
      { path: '/', redirectTo: '/view'},

      { path: '/view', component: 'notes'},
      { path: '/archive', component: 'archive'},
      { path: '/dyagraph', component: 'dyagraph'},
      { path: '/search', component: 'search'}
    ]);
  }

  // Allow to navigate to this router only if we can load notes.
  canActivate () {
    if (this.notesManager.notesLoaded) {
      this.$log.info('AuthenticatedController canActivate: true (notes already loaded)');
      return true;
    }
    if (!this.auth.isAuthenticated()) {
      this.$log.info('AuthenticatedController canActivate: false (user not logged in)');
      return false;
    }
    return this.notesManager.loadAll().then(() => {
      this.$log.info('AuthenticatedController canActivate: true (loaded notes)');
      return true;
    }, reason => {
      this.$log.warn('AuthenticatedController canActivate: false (cant read notes)');
      return this.$q.reject(reason);
    });
  }
}

angular.module('dyanote').controller('AuthenticatedController', AuthenticatedController);