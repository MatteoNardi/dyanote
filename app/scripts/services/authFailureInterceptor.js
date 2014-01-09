'use strict';

angular.module('dyanote')

// authFailureInterceptor is an interceptor we add to $http.
// Every time it detects a "401 Unauthorized" response from the server,
// it inserts the request into the retry queue, which will execute it
// again once we'll be authenticated.
// This code is a modification of https://github.com/angular-app/angular-app/blob/master/client/src/common/security/interceptor.js
.service('authFailureInterceptor', ['$q', '$injector', 'authRetryQueue', function authFailureInterceptor ($q, $injector, queue) {
  this.responseError = function (request) {
    // do something on error
    if (request.status === 401) {
      var promise = queue.pushRetryFn('unauthorized-server', function retryRequest () {
        return $injector.get('$http')(request.config);
      });
      return promise;
    }
    return $q.reject(request);
  };
}])

.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('authFailureInterceptor');
}]);
