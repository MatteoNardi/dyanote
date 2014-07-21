'use strict';

angular.module('dyanote')

// auth is the authentication service.
// - Log user in and out of Dyanote
// - Load user session from local storage
// - Add authentication headers to all http requests.
.service('auth', function ($http, $location, $log, localStorageService, authRetryQueue, SERVER_CONFIG) {

  var auth = this;

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

  // Attempt to authenticate a user by the given email and password
  this.login = function (email, password, remembar) {
    var loginUrl = SERVER_CONFIG.apiUrl + 'users/' + email + '/login/';
    var data = 'client_id=' + encodeURIComponent(SERVER_CONFIG.clientId)
      + '&client_secret=' + encodeURIComponent(SERVER_CONFIG.clientSecret)
      + '&grant_type=password'
      + '&username=' + encodeURIComponent(email)
      + '&password=' + encodeURIComponent(password);

    var _this = this;
    return $http.post(loginUrl, data, {'headers': {'Content-Type': 'application/x-www-form-urlencoded'}}).then(function (response) {
      $log.info('Login successful');
      currentUser.email = email;
      currentUser.authToken = response.data.access_token;
      updateHttpHeaders.call(_this);
      // We've successfully authenticated: retry all failed tasks.
      authRetryQueue.retryAll();
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

  // Give up trying to login and clear the retry queue
  this.cancelLogin = function () {
    authRetryQueue.cancelAll();
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
    if (auth.isAuthenticated)
      updateHttpHeaders();
    return auth.isAuthenticated();
  };

  // When an item is added to the retry queue, user needs to login again.
  authRetryQueue.onItemAddedCallbacks.push(function(retryItem) {
    if ( authRetryQueue.hasMore() ) {
      $location.path('/login');
    }
  });

  // Configure Angular to send user credentials in each http request.
  var updateHttpHeaders = function () {
    if(auth.isAuthenticated())
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + currentUser.authToken;
    else
      delete $http.defaults.headers.common['Authorization'];
  }

  // At startup we should load settings
  this.loadFromSettings();
});
