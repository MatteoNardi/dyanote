
// Integrate the React search component.
angular.module('dyanote').controller('searchFRPController', function ($scope, openNotes, frp_backend) {
  var search = frp_backend.search_engine();

  this.props = {
    open: note => openNotes.open(note),
    search: text => {
      this.props.text = text;
      this.props.results.length = 0;
      search(text)
        .take(6)
        .onValue(result => this.props.results.push(result))
        .onEnd(() => this.props.running = false)
        .onAny(_ => $scope.$$phase || $scope.$apply())
        .onError((err) => console.log(err));
    },
    text: '',
    running: false,
    results: []
  };
});
