
class TrashController {

  constructor ($rootScope, notesGraph, notesManager) {
    $rootScope.$watch(
      _ => R.join('|', notesGraph.allTrashed()),
      _ => R.forEach(notesManager.loadTitle.bind(notesManager), notesGraph.allTrashed())
    );

    this.notesGraph = notesGraph;
  }

  activate () {
    this.notes = this.notesGraph.allTrashed;
  }
}

angular.module('dyanote').controller('TrashController', TrashController);
