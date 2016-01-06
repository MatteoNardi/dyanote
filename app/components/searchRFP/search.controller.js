
// Integrate the React search component.
angular.module('dyanote').controller('searchFRPController', function ($rootScope, openNotes) {
  this.props = {
    open: function (note) {
      console.log('OPEN', note);
      openNotes.open(note);
      // $rootScope.$apply();
    }
  };
});
