'use strict';

angular.module('dyanote', ['ngNewRouter', 'LocalStorageModule', 'ui.bootstrap'])

.constant('SERVER_CONFIG', {
  // apiUrl: 'https://dyanote.herokuapp.com/api/',
  // // Needed by OAuth to identify this client. 
  // clientId: 'edfd9c435154a6f75673',
  // clientSecret: 'cf3aba97518712959062b52dc5c524dd4f6741bd'

  apiUrl: 'http://localhost:5000/api/',
  clientId: 'bb05c6ab017f50116084',
  clientSecret: '4063c2648cdd7f2e4dae563da80a516f2eb6ebb6'
})

.config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
})

.config(function ($componentLoaderProvider) {
  // The default mapping is to ./components/<name>/<name>.html, but
  // our build system and gulp-angular-templatecache can only map to
  // components/<name>/<name>.html without the './' prefix.
  $componentLoaderProvider.setTemplateMapping(function (name) {
    return name + '/' + name + '.html';
  });
})

.controller('MainController', function ($router) {
  $router.config([
    { path: '/', redirectTo: '/login'},

    { path: '/login', component: 'login'},
    { path: '/register', component: 'register'},
    { path: '/logout', component: 'logout'},
    { path: '/notes', component: 'notes'},
    { path: '/archive', component: 'archive'},
    { path: '/search', component: 'search'},
  ])
});