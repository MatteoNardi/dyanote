'use strict';

describe('Service: auth', function () {
  beforeEach(module('dyanote'));

  var auth,
    localStorageService,
    $httpBackend,
    $http,
    API_URL;

  beforeEach(inject(function (_auth_, _$httpBackend_, _$http_, _localStorageService_, _SERVER_CONFIG_) {
    auth = _auth_;
    $httpBackend = _$httpBackend_;
    $http = _$http_;
    localStorageService = _localStorageService_;
    API_URL = _SERVER_CONFIG_.apiUrl;
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
    $httpBackend.expect('POST', API_URL + 'users/username/login/')
      .respond(200, {"access_token": "<your-access-token>", "scope": "read", "expires_in": 86399, "refresh_token": "<your-refresh-token>"});
    auth.login('username', '123123');
    
    $httpBackend.flush();

    expect(auth.isAuthenticated()).toBe(true);
  });

  it('should execute onLogin callback on login', function () {
    var callbackCalled = false;
    auth.onLogin.push(function() {
      callbackCalled = true;
    });
    $httpBackend.expect('POST', API_URL + 'users/username/login/')
      .respond(200, {"access_token": "<your-access-token>", "scope": "read", "expires_in": 86399, "refresh_token": "<your-refresh-token>"});
    auth.login('username', '123123');
    
    $httpBackend.flush();
    
    expect(callbackCalled).toBe(true);
  });

  it('should add auth headers', function () {
    $httpBackend.expect('POST', API_URL + 'users/username/login/')
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
    $httpBackend.expect('POST', API_URL + 'users/username/login/')
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

  it('should register new users', function () {
    $httpBackend.expect('POST', API_URL + 'users/', '{"email":"username","password":"123123"}')
      .respond(200);
    
    auth.register('username', '123123');
    $httpBackend.flush();
  })
});
