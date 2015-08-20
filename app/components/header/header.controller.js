
class HeaderController {
  constructor (backend, $location) {
    this.backend = backend;
    this.$location = $location;
  }

  get username () {
    return this.backend.getUserVisibleName();
  }

  logout () {
    this.backend.logout();
    this.notesGraph.clear();
    this.$log.info('Logout');
    this.$location.path('/login');
  }
}

angular.module('dyanote').controller('HeaderController', HeaderController);
