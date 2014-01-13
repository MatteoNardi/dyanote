'use strict';

describe('Service: auth', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var auth, $httpBackend, $http, $rootScope;
  beforeEach(inject(function ($injector) {
    auth = $injector.get('auth');
    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');
    $http = $injector.get('$http');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should do something', function () {
    expect(!!auth).toBe(true);
  });

  it('should start logged out', function () {
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('should login', function () {
    $httpBackend.expect('POST', 'https://dyanote.herokuapp.com/api/oauth2/access_token?client_id=edfd9c435154a6f75673&client_secret=cf3aba97518712959062b52dc5c524dd4f6741bd&grant_type=password&username=username&password=123123')
      .respond(200, {"access_token": "<your-access-token>", "scope": "read", "expires_in": 86399, "refresh_token": "<your-refresh-token>"});
    auth.login('username', '123123');
    
    $httpBackend.flush();
    $rootScope.$apply();
    expect(auth.isAuthenticated()).toBe(true);
  });
});
