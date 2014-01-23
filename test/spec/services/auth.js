'use strict';

describe('Service: auth', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var auth, localStorageService, $httpBackend, $http;
  beforeEach(inject(function ($injector) {
    auth = $injector.get('auth');
    $httpBackend = $injector.get('$httpBackend');
    $http = $injector.get('$http');
    localStorageService = $injector.get('localStorageService');
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

  it('should save user to local storage', function () {
    spyOn(localStorageService, 'add').andReturn(false);
    $httpBackend.expect('POST', 'https://dyanote.herokuapp.com/api/oauth2/access_token/')
      .respond(200, {"access_token": "<your-access-token>", "scope": "read", "expires_in": 86399, "refresh_token": "<your-refresh-token>"});
    auth.login('username', '123123', true);
    $httpBackend.flush();
    expect(localStorageService.add).toHaveBeenCalledWith('currentUser', {email: 'username', authToken: '<your-access-token>'});
  });

  it('should load user from local storage', function () {
    spyOn(localStorageService, 'get').andReturn({email: 'username', authToken: '<your-access-token>'});
    
    var r = auth.loadFromSettings();

    expect(r).toBe(true);
    expect(auth.getEmail()).toEqual('username');
    expect(localStorageService.get).toHaveBeenCalledWith('currentUser');
  });

  it('should clear local storage on logout', function () {
    spyOn(localStorageService, 'clearAll');
    auth.logout();
    expect(localStorageService.clearAll).toHaveBeenCalled();
  });

  it('should should not crash on corrupter local storage', function () {
    spyOn(localStorageService, 'get').andReturn(null);
    expect(auth.loadFromSettings()).toBe(false);
  });
});
