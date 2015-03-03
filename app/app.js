'use strict';

angular.module('dyanote', ['ngRoute', 'LocalStorageModule', 'ui.bootstrap'])

.constant('SERVER_CONFIG', {
  // apiUrl: 'https://dyanote.herokuapp.com/api/',
  // // Needed by OAuth to identify this client. 
  // clientId: 'edfd9c435154a6f75673',
  // clientSecret: 'cf3aba97518712959062b52dc5c524dd4f6741bd'

  apiUrl: 'http://localhost:5000/api/',
  clientId: 'bb05c6ab017f50116084',
  clientSecret: '4063c2648cdd7f2e4dae563da80a516f2eb6ebb6'
})

.config(function ($routeProvider) {
  $routeProvider
    .when('/login', {
      templateUrl: 'login/login.html',
      controller: 'LoginCtrl'
    })
    .when('/register', {
      templateUrl: 'register/register.html',
      controller: 'RegisterCtrl'
    })
    .when('/logout', {
      templateUrl: 'logout/logout.html',
      controller: 'LogoutCtrl'
    })
    .when('/notes', {
      templateUrl: 'notes/notes.html',
      controller: 'NotesCtrl'
    })
    // TODO: Archive
    .when('/dyagraph', {
      templateUrl: 'dyagraph/dyagraph.html',
    })
    .when('/search', {
      templateUrl: 'search/search.html',
      controller: 'SearchCtrl'
    })
    .otherwise({
      redirectTo: '/login'
    });
})

.config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
})

.controller('MainCtrl', function (notesManager, $scope) {
  notesManager.init();
});