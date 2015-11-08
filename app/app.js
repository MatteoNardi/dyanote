
angular.module('dyanote', [
  'ngAnimate',          // Animations module
  'ngNewRouter',        // Angular 2 Router
  'LocalStorageModule', // Browser local storage access
  '720kb.tooltips'      // Tooltips directive
])

.config(function ($locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $locationProvider.hashPrefix('!');
})

// Configure Router.
// The default mapping is to ./components/<name>/<name>.html, but
// our build system and gulp-angular-templatecache can only map to
// components/<name>/<name>.html without the './' prefix.
.config(function ($componentLoaderProvider) {
  $componentLoaderProvider.setTemplateMapping(function (name) {
    return name + '/' + name + '.html';
  });
})

// Configure 720kb.tooltips directive
.config(function(tooltipsConfigProvider) {
  tooltipsConfigProvider.options({
    lazy: false,
    size: 'small',
    delay: 400,
    try: false
  });
})

.controller('MainController', function ($router) {
  $router.config([
    { path: '/', redirectTo: '/login'},

    { path: '/login', component: 'login'},
    { path: '/notes', component: 'authenticated'}
  ]);
});
