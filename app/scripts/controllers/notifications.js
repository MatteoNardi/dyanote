'use strict';

angular.module('dyanote')

// Connects notifications template with notifications service
.controller('NotificationsCtrl', function ($scope, $timeout, notifications) {
  $scope.notifications = [];

  $scope.$watch(function () {
    // Note: this is bad from performance point of view
    return notifications.notifications.length 
  }, onNewNotification);

  // Todo: Hovering should stop hide timeout
  var counter = 0;
  function onNewNotification () {
    var source = notifications.notifications,
        dest = $scope.notifications;
    while (counter < source.length) {
      var item = source[counter++];
      dest.push(item);
      $timeout(function () {
        var pos = dest.indexOf(item);
        if (pos != -1)
          dest.splice(pos, 1);
      }, 2000);
    }
  }
});
