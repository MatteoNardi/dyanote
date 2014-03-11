'use strict';

describe('Service: Notescoherencetools', function () {

  // load the service's module
  beforeEach(module('DyanoteApp'));

  // instantiate service
  var Notescoherencetools;
  beforeEach(inject(function (_Notescoherencetools_) {
    Notescoherencetools = _Notescoherencetools_;
  }));

  it('should do something', function () {
    expect(!!Notescoherencetools).toBe(true);
  });

});
