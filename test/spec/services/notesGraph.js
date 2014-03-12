'use strict';

describe('Service: notesGraph', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var notesGraph;
  beforeEach(inject(function (_notesGraph_) {
    notesGraph = _notesGraph_;
  }));

  it('should do something', function () {
    expect(!!notesGraph).toBe(true);
  });

});
