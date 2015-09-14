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

  // Getter and setters for ES6 maps and sets.
  D.setter = R.curry((object, key, value) => object.set(key, value));
  D.getter = R.curry((object, key) => object.get(key));

  // Log a value and return it
  D.log = x => {
    console.warn('Log', x);
    return x;
  };

  // Make a function print its arguments before executing.
  D.debug = fn => {
    function newFn () {
      console.warn('Debug', arguments);
      fn.apply(this, arguments);
    }
    if (fn.length)
      return R.curryN(fn.length, newFn);
    else return newFn;
  };

  D.exists = x => !!x;
  D.ifExists = R.ifElse(D.exists);
  D.executeAll = R.curryN(2, (callbacks, x) => callbacks.forEach(cb => cb(x)));

  // Convert n arguments to a list of arguments
  D.list = n => R.curryN(n, function () { return Array.prototype.slice.call(arguments); });
} ());
