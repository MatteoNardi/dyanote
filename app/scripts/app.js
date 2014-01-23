'use strict';

angular.module('dyanote', ['ngRoute', 'ngResource', 'LocalStorageModule'])

.constant('SERVER_CONFIG', {
  apiUrl: 'https://dyanote.herokuapp.com/api/',
  // Needed by OAuth to identify this client. 
  clientId: 'edfd9c435154a6f75673',
  clientSecret: 'cf3aba97518712959062b52dc5c524dd4f6741bd'
})

.config(function ($routeProvider) {
  $routeProvider
    .when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .when('/logout', {
      templateUrl: 'views/logout.html',
      controller: 'LogoutCtrl'
    })
    .when('/register', {
      templateUrl: 'views/register.html',
      controller: 'RegisterCtrl'
    })
    .when('/notes', {
      templateUrl: 'views/notes.html',
      controller: 'NotesCtrl'
    })
    .otherwise({
      redirectTo: '/login'
    });
})

.config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
});