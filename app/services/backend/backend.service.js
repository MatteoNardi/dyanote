
class backend {
  constructor (SERVER_CONFIG, notifications, $rootScope) {
    this.notifications = notifications;
    this.$rootScope = $rootScope;

    this.firebase = new Firebase(SERVER_CONFIG.apiUrl);

    this.firebase.onAuth(authData => {
      this.authData = authData;
      this.userRef = this.firebase.child(authData.uid);
      this.digest();
    });
  }

  isAuthenticated () {
    return !!this.authData;
  }

  getUserVisibleName () {
    return this.authData.google.displayName;
  }

  getUserAvatar () {
    return this.authData.google.profileImageURL;
  }

  login () {
    this.firebase.authWithOAuthPopup('google', err => {
      if (err) {
        this.notifications.warn('Login failure');
        console.warn(err);
      }
      else this.notifications.success('Logged in');
    });
  }


  logout () {
    this.firebase.unauth();
  }

  onGraphUpdate (cb) {
    this.userRef.child('graph').on('value', graph => {
      // console.info('graph', graph)
      if (graph.exists())
        cb(graph.val());
      else
        this.newUserAccount();
      this.digest();
    });
  }

  newNote (parent, title) {
    console.info('new note');
    var ref = this.userRef.child('graph').push(parent || "",
      this.errorCallback('Error creating new note'));
    var id = ref.key();
    this.userRef.child('titles').child(id).set(title,
      this.errorCallback('Error creating setting the new note title'));
    this.userRef.child('bodies').child(id).set('',
      this.errorCallback('Error creating setting the new note body'));
    return id;
  }

  onTitleUpdate (id, cb) {
    this.userRef.child('titles').child(id).on('value', title => {
      cb(title.val());
      this.digest();
    });
  }

  onBodyUpdate (id, cb) {
    this.userRef.child('bodies').child(id).on('value', body => {
      cb(body.val());
      this.digest();
    });
  }

  // Notes created on first login.
  newUserAccount () {
    this.newNote(null, 'Welcome to Dyanote');
    // TODO: Add a set of default notes which make sense.
  }


  // Utility: display error on console
  errorCallback (msg) {
    return (err) => {
      if (err)
        console.warn(msg, err);
    };
  }

  // Utility: Make sure we run a digest cycle
  digest () {
    if (!this.$rootScope.$$phase)
      this.$rootScope.$apply();
  }
}

angular.module('dyanote').service('backend', backend);
