'use strict';

angular.module('dyanote')

// authRetryQueue is a generic retry queue for security failures.
// Each item is expected to expose two functions: retry and cancel.
// This code is a modification of https://github.com/angular-app/angular-app/blob/master/client/src/common/security/retryQueue.js
.service('authRetryQueue', ['$q', '$log', function($q, $log) {
  var retryQueue = [];

  // The security service puts its own handler in here!
  this.onItemAddedCallbacks = [];

  this.hasMore = function() {
    return retryQueue.length > 0;
  };

  this.push = function(retryItem) {
    retryQueue.push(retryItem);
    // Call all the onItemAdded callbacks
    angular.forEach(this.onItemAddedCallbacks, function(cb) {
      try {
        cb(retryItem);
      } catch(e) {
        $log.error('authRetryQueue.push(retryItem): callback threw an error' + e);
      }
    });
  };

  this.pushRetryFn = function(reason, retryFn) {
    // The reason parameter is optional
    if (arguments.length === 1) {
      retryFn = reason;
      reason = undefined;
    }

    // The deferred object that will be resolved or rejected by calling retry or cancel
    var deferred = $q.defer();
    var retryItem = {
      reason: reason,
      retry: function() {
        // Wrap the result of the retryFn into a promise if it is not already
        $q.when(retryFn()).then(function(value) {
          // If it was successful then resolve our deferred
          deferred.resolve(value);
        }, function(value) {
          // Othewise reject it
          deferred.reject(value);
        });
      },
      cancel: function() {
        // Give up on retrying and reject our deferred
        deferred.reject();
      }
    };
    this.push(retryItem);
    return deferred.promise;
  };

  this.retryReason = function() {
    return this.hasMore() && retryQueue[0].reason;
  };

  this.cancelAll = function() {
    while(this.hasMore()) {
      retryQueue.shift().cancel();
    }
  };

  this.retryAll = function() {
    while(this.hasMore()) {
      retryQueue.shift().retry();
    }
  }
}]);
