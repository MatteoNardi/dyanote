
class backend {
  constructor (SERVER_CONFIG, notifications, $rootScope) {
    this.notifications = notifications;

    this.firebase = new Firebase(SERVER_CONFIG.apiUrl);

    this.firebase.onAuth(authData => {
      this.authData = authData;
      // This will get called both within aungular (on construction) and outside
      // of it (on login)
      if (!$rootScope.$$phase) $rootScope.$apply();
    });
  }

  isAuthenticated () {
    return !!this.authData;
  }

  getUserVisibleName () {
    return this.authData.google.displayName;
  }

  login () {
    this.firebase.authWithOAuthPopup('google', err => {
      if (err)
        this.notifications.warn('Login failure');
      else this.notifications.success('Logged in');
    });
  }

  logout () {
    this.firebase.unauth();
  }
}

angular.module('dyanote').service('backend', backend);
