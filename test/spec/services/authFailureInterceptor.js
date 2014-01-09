'use strict';

describe('Service: authFailureInterceptor', function () {

  // load the service's module
  beforeEach(module('clientApp'));

  // instantiate services and initialize variables
  var $rootScope, authFailureInterceptor, authRetryQueue;
  beforeEach(inject(function (_authFailureInterceptor_, _authRetryQueue_, _$rootScope_) {
    authFailureInterceptor = _authFailureInterceptor_;
    authRetryQueue = _authRetryQueue_;
    $rootScope = _$rootScope_;
  }));

  it('should do something', function () {
    expect(!!authFailureInterceptor).toBe(true);
  });

  it('does not intercept non-401 error responses', function() {
    var httpResponse = {
      status: 400
    };
    var newPromise = authFailureInterceptor.responseError(httpResponse);
    var response;
    newPromise.then(null, function(rejection) {
      response = rejection;
    });
    $rootScope.$apply();
    expect(response).toBe(httpResponse);
  });

  it('intercepts 401 error responses and adds it to the retry queue', function() {
    var notAuthResponse = {
      status: 401
    };
    var newPromise = authFailureInterceptor.responseError(notAuthResponse);
    var response;
    newPromise.then(null, function(rejection) {
      response = rejection;
    });
    $rootScope.$apply();
    expect(response).toBe(undefined);
    expect(authRetryQueue.hasMore()).toBe(true);
    expect(authRetryQueue.retryReason()).toBe('unauthorized-server');
  });
});
