
// User notification service.
class notifications {
  
  constructor () {
    this._notifications = [];
  }

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
  get notifications () {
    return this._notifications;
  }

  // Display warning (Eg. implicit notes deletions)
  warn (label, actions) {
    this._add('warn', label, actions)
  }

  // Display safe informations (Eg. explicit notes deletions)
  info (label, actions) {
    this._add('info', label, actions)
  }

  // Display success (Eg. notes updates from server)
  success (label, actions) {
    this._add('success', label, actions)
  }

  // Private: display generic notification
  _add (type, label, actions) {
    this.notifications.push({
      time: Date.now(),
      label: label,
      type: type,
      actions: actions
    });
  };  
}

angular.module('dyanote').service('notifications', notifications);
