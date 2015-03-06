
class LogoutController {
  constructor ($log, $location, $timeout, auth, notesGraph) {
    this.auth = auth;
    this.notesGraph = notesGraph;
    this.$log = $log;
    this.$location = $location;
    this.$timeout = $timeout;
  }

  activate () {
    this.auth.logout();
    this.notesGraph.clear();
    this.$log.info('Logout');
    this.$timeout(() => this.$location.path('/login'), 3000);
  }
}

angular.module('dyanote').controller('LogoutController', LogoutController);
