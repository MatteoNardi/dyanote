'use strict';

describe('Service: notesCoherenceTools', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var notesCoherenceTools;
  beforeEach(inject(function (_notesCoherenceTools_) {
    notesCoherenceTools = _notesCoherenceTools_;
  }));

  it('should do something', function () {
    expect(!!notesCoherenceTools).toBe(true);
  });

});

