'use strict';

angular.module('dyanote')

// auth is the authentication service.
// - Log user in and out of Dyanote
// - Load user session from local storage
// - Add authentication headers to all http requests.
.service('auth', function ($http, $location, $log, localStorageService, httpFailureInterceptor, SERVER_CONFIG) {

  var me = this;

  // Information about the current user
  var currentUser = {
    email: null,
    authToken: null
  }

  this.getEmail = function () {
    return currentUser.email;
  };

  // Is the current user authenticated?
  this.isAuthenticated = function () {
    return !!currentUser.authToken;
  };

  // List of callbacks executed after a successful login
  this.onLogin = [];

  // Attempt to authenticate a user by the given email and password
  this.login = function (email, password, remembar) {
    var loginUrl = SERVER_CONFIG.apiUrl + 'users/' + email + '/login/';
    var data = 'client_id=' + encodeURIComponent(SERVER_CONFIG.clientId)
      + '&client_secret=' + encodeURIComponent(SERVER_CONFIG.clientSecret)
      + '&grant_type=password'
      + '&username=' + encodeURIComponent(email)
      + '&password=' + encodeURIComponent(password);

    var headers = {
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    return $http.post(loginUrl, data, headers).then(function (response) {
      $log.info('Login successful');
      currentUser.email = email;
      currentUser.authToken = response.data.access_token;
      updateHttpHeaders.call(me);
      me.onLogin.forEach(function (cb) { cb(); })
      if (remembar) {
        localStorageService.add('currentUser', currentUser);
      }
    });
  };

  // Register a new user
  this.register = function (email, password) {
    var registerUrl = SERVER_CONFIG.apiUrl + 'users/';
    var data = {
      'email': email,
      'password': password
    };
    return $http.post(registerUrl, data);
  };

  // Logout the current user
  this.logout = function () {
    currentUser.email = null;
    currentUser.authToken = null;
    updateHttpHeaders();
    $location.path('/login');
    localStorageService.clearAll();
    // TODO: delete OAuth2 session from server instead of just forgetting it.
  };

  // Load user information from settings.
  this.loadFromSettings = function () {
    var stored = localStorageService.get('currentUser');
    if (stored && stored.email && stored.authToken) {
      currentUser = {
        email: stored.email,
        authToken: stored.authToken
      }
    }
    if (me.isAuthenticated)
      updateHttpHeaders();
    return me.isAuthenticated();
  };

  // Configure Angular to send user credentials in each http request.
  var updateHttpHeaders = function () {
    if(me.isAuthenticated())
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + currentUser.authToken;
    else
      delete $http.defaults.headers.common['Authorization'];
  }

  // At startup we should load settings
  this.loadFromSettings();
})

// Add interceptor to automatic1ally logout when server returns a 401 error.
.service('httpFailureInterceptor', function () {
  this.onErrorCallback = function () {};
  this.responseError = function(response) {
    if (response.status === 401) {
      $log.warn("Intercepted failed request");
      this.onErrorCallback();
    }
  };
})
.config(function($httpProvider) {
  $httpProvider.interceptors.push('httpFailureInterceptor');
});