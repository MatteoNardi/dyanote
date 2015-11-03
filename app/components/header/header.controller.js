
class HeaderController {
  constructor (backend, $location, $log) {
    this.backend = backend;
    this.$location = $location;
    this.$log = $log;
  }

  get username () {
    return this.backend.getUserVisibleName();
  }

  get avatar () {
    return this.backend.getUserAvatar();
  }

  logout () {
    this.backend.logout();
    // this.notesGraph.clear();
    this.$log.info('Logout');
    this.$location.path('/login');
  }

  createBackup () {
    this.backend.backup(backup => {
      console.info(backup);
      // We use FileSaver to save file https://github.com/eligrey/FileSaver.js
      var blob = new Blob([backup], { type: 'application/json;charset=utf-8'} );
      saveAs(blob, 'Dyanote Backup.json');
    });
  }

  restoreBackup () {
    var backup = window.prompt('Paste your json backup here');
    this.backend.restore(backup);
  }
}

angular.module('dyanote').controller('HeaderController', HeaderController);
