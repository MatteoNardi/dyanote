'use strict';

angular.module('dyanote', ['ngRoute', 'LocalStorageModule', 'ui.bootstrap'])

.constant('SERVER_CONFIG', {
  apiUrl: 'https://dyanote.herokuapp.com/api/',
  // Needed by OAuth to identify this client. 
  clientId: 'edfd9c435154a6f75673',
  clientSecret: 'cf3aba97518712959062b52dc5c524dd4f6741bd'

  // apiUrl: 'http://localhost:5000/api/',
  // clientId: '00d4f7b617b9c4434d52',
  // clientSecret: '64d86e2fe1709a8340b91463a6a3c9fb927591fc'
})

.config(function ($routeProvider) {
  $routeProvider
    .when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .when('/register', {
      templateUrl: 'views/register.html',
      controller: 'RegisterCtrl'
    })
    .when('/logout', {
      templateUrl: 'views/logout.html',
      controller: 'LogoutCtrl'
    })
    .when('/notes', {
      templateUrl: 'views/notes.html',
      controller: 'NotesCtrl'
    })
    // TODO: Archive
    .when('/dyagraph', {
      templateUrl: 'views/dyagraph.html',
      controller: 'DyagraphCtrl'
    })
    .when('/search', {
      templateUrl: 'views/search.html',
      controller: 'SearchCtrl'
    })
    .otherwise({
      redirectTo: '/login'
    });
})

.config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
});