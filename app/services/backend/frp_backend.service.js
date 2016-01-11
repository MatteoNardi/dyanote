
angular.module('dyanote').service('frp_backend', function (backend) {
  var firebase = backend.firebase;

  // Create new search engine
  this.search_engine = function () {
    var cancel = function () {};
    var cancelSearch = Kefir.stream(emitter => {
      cancel = () => emitter.error('cancelled');
    });
    return text => {
      // Todo: this doesn't work
      cancel();
      var searchResults = Kefir.sequentially(300, [
        {id: '-JzGslRW2A5ykQygsp6u', title: 'My home'},
        {id: '-K7I1rUP5iXISb36ICzs', title: 'Coccodrillo'},
        {id: '-JzGslRW2A5ykQygsp6u', title: 'Hello world'}
      ]);
      return searchResults.merge(cancelSearch).log();
    };
  };
});
//
// var test = new Firebase('https://dyanote-devel.firebaseio.com/P');
//
// console.warn('===========================');
//
// test.set({a0: -1, a1: 0, a2: 2});
//
//
// var stream = ref => Kefir.stream(emitter => {
//     var fn = ref.on('value', d => {
//         var val = d.val();
//         console.warn('...', val);
//         emitter.emit(val);
//     });
//
//     return () => {
//         console.warn('unsubscribe');
//         ref.off('value', fn);
//     };
// });
// var log = x => console.warn(x);
// var s = Kefir.combine([
//     stream(test.child('a0')),
//     stream(test.child('a1')),
//     stream(test.child('a2'))
// ], (a, b, c) => ({ a0: a, a1: b, a2: c })).onValue(log);
// setTimeout(() => s.offValue(log), 2000);
