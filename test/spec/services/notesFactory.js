'use strict';

describe('Service: Notesfactory', function () {

  // load the service's module
  beforeEach(module('DyanoteApp'));

  // instantiate service
  var Notesfactory;
  beforeEach(inject(function (_Notesfactory_) {
    Notesfactory = _Notesfactory_;
  }));

  it('should do something', function () {
    expect(!!Notesfactory).toBe(true);
  });

});
