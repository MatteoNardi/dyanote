'use strict';

describe('Service: notesFactory', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var notesFactory;
  beforeEach(inject(function (_notesFactory_) {
    notesFactory = _notesFactory_;
  }));

  it('should do something', function () {
    expect(!!notesFactory).toBe(true);
  });

});
