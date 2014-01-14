'use strict';

describe('Service: auth', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var auth, $httpBackend, $http;
  beforeEach(inject(function ($injector) {
    auth = $injector.get('auth');
    $httpBackend = $injector.get('$httpBackend');
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
    $httpBackend.expect('POST', 'https://dyanote.herokuapp.com/api/oauth2/access_token/')
      .respond(200, {"access_token": "<your-access-token>", "scope": "read", "expires_in": 86399, "refresh_token": "<your-refresh-token>"});
    auth.login('username', '123123');
    
    $httpBackend.flush();

    expect(auth.isAuthenticated()).toBe(true);
  });

  it('should add auth headers', function () {
    $httpBackend.expect('POST', 'https://dyanote.herokuapp.com/api/oauth2/access_token/')
      .respond(200, {"access_token": "<your-access-token>", "scope": "read", "expires_in": 86399, "refresh_token": "<your-refresh-token>"});
    auth.login('username', '123123');

    $httpBackend.flush();
    $httpBackend.expectGET('/test', function(headers) {
       return headers['Authorization'] == 'Bearer <your-access-token>';
    }).respond(200, "Ok");
    $http.get('/test');
    $httpBackend.flush();
  });
});
