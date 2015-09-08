// Functional programming utilities (Exposed in the D global variable)

(function () {

  var D = window.D = {};

  // dfs: (x -> [x]) -> (x -> [y]) -> x -> [y]
  D.dfs = R.curry((getNewItems, getResults, start) => {
    let stack = [start],
      results = [],
      item;
    while((item = stack.pop())) {
      results.push(getResults(item));
      stack = stack.concat(getNewItems(item));
    }
    return results;
  });

  D.callMethod = R.converge(R.bind, R.prop, R.nthArg(1));
  D.setter = D.callMethod('set');
  D.getter = D.callMethod('get');
  D.log = x => { console.log(x); return x; };
} ());
