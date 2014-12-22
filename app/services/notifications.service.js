'use strict';

angular.module('dyanote')

// User notification service.
.service('notifications', function () {
  var me = this;

  // List of notification objects:
  // {
  //   time: int
  //   label: string
  //   type: 'warn' | 'info' | 'success'
  //   actions: [
  //     { 
  //       label: string
  //       callback: function ()
  //     }, ...
  //   ]
  // }
  this.notifications = [];

  // Display warning (Eg. implicit notes deletions)
  this.warn = function (label, actions) {
    add('warn', label, actions)
  }

  // Display safe informations (Eg. explicit notes deletions)
  this.info = function (label, actions) {
    add('info', label, actions)
  }

  // Display success (Eg. notes updates from server)
  this.success = function (label, actions) {
    add('success', label, actions)
  }

  function add (type, label, actions) {
    me.notifications.push({
      time: Date.now(),
      label: label,
      type: type,
      actions: actions
    });
  };
});
