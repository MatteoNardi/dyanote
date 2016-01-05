
// Integrate the React search component.
angular.module('dyanote').controller('searchFRPController', function ($scope, openNotes) {
  $scope.props = {
    open: function (note) {
      openNotes.open(note);
      $scope.$apply();
    }
  };
});
