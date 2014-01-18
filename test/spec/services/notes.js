'use strict';

describe('Service: notes', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var notes, auth;
  beforeEach(inject(function (_notes_, _auth_) {
    notes = _notes_;
    auth = _auth_;
    spyOn(auth, 'isAuthenticated').andReturn(true);
    spyOn(auth, 'getEmail').andReturn('matteo@example.com');
  }));

  it('should do something', function () {
    expect(!!notes).toBe(true);
  });

});
