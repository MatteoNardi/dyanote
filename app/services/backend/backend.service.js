
function backend (SERVER_CONFIG, notifications, $rootScope) {
  function init () {
    firebase.onAuth(newAuth => {
      authData = newAuth;
      if (userRef) userRef.off();
      userRef = authData ? firebase.child(authData.uid) : null;
      if (userRef)
        watchGraph();
      digest();
    });
  }

  var
    firebase = new Firebase(SERVER_CONFIG.apiUrl),
    authData = null,
    userRef = null,

    isAuthenticated = _ =>
      !!authData,

    getUserVisibleName = _ =>
      R.path(['google', 'displayName'], authData),

    getUserAvatar = _ =>
      R.path(['google', 'profileImageURL'], authData),

    login = _ =>
      firebase.authWithOAuthPopup('google', R.ifElse(
        D.exists,
        err => {
          notifications.warn('Login failure');
          console.warn(err);
        },
        _ => {
          notifications.success('Logged in');
        }
      )),

    logout = _ => firebase.unauth(),

    // Eg. getUserObject('titles/42') -> Firebase ref
    getUserObject = c => userRef.child(c),
    // Eg. below('titles', 42) -> 'titles/42'
    below = R.compose(R.join('/'), D.list(2)),
    addWatch = R.curry((path, cb) => userRef.child(path).on('value', d => {
      cb(d.val());
      digest();
    })),
    // Eg. setNoteProperty('titles', 42, 'New title...')
    // setNoteProperty = R.compose(R.flip(R.invoker(1, 'set')), getUserObject, below),
    setNoteProperty = R.curry((prop, note, value) => {
      getUserObject(below(prop, note)).set(value);
    }),
    // setNoteProperty = setRef

    // Eg. updateTitle('42', 'New title...')
    updateTitle = setNoteProperty('titles'),
    updateBody = setNoteProperty('bodies'),
    updateParent = setNoteProperty('graph'),

    trash = setNoteProperty('trash', R.__, true),

    // Eg. onTitleUpdate('42', newTitle => { ... })
    onTitleUpdate = R.useWith(addWatch, below('titles')),
    onBodyUpdate = R.useWith(addWatch, below('bodies')),

    graphListeners = [],
    onGraphUpdate = cb => graphListeners.push(cb),
    watchGraph = _ => {
      var graph = {}, trash = {};
      let update = R.pipe(
        R.keys,
        R.map(k => ({ id: k, parent: graph[k], trashed: trash[k] })),
        D.executeAll(graphListeners)
      );
      addWatch('graph', g => {
        graph = g;
        if (!graph) newUserAccount();
        update(graph);
      });
      addWatch('trash', t => {
        if (!t) return;
        trash = t;
        update(graph);
      });
    },

    newNote = (parent, title) => {
      var ref = userRef.child('graph').push(parent || "", errorCallback('Error creating new note'));
      var id = ref.key();
      userRef.child('titles').child(id).set(title, errorCallback('Error creating setting the new note title'));
      userRef.child('bodies').child(id).set('', errorCallback('Error creating setting the new note body'));
      return id;
    },

    newUserAccount = _ => newNote(null, 'Welcome to Dyanote'),

    backup = callback => {
      console.info('backup');
      userRef.once('value', data => {
        var notes = data.val();
        console.info(notes);
        console.info(notes);
        var serialization = Object.keys(notes.graph).map(key => ({
          id: key,
          title: notes.titles[key],
          body: notes.bodies[key],
          parent: notes.graph[key]
        }));
        callback(JSON.stringify(serialization));
      });
    },

    restore = data => {
      try {
        console.info(data);
        JSON.parse(data).forEach(note => {
          updateTitle(note.id, note.title);
          updateBody(note.id, note.body);
          updateParent(note.id, note.parent);
        });
      } catch (e) {
        console.warn(e);
      }
    },

    // Utility: display error on console
    errorCallback = msg => (err => err && console.warn(msg, err)),

    // Utility: Make sure we run a digest cycle
    digest = _ => $rootScope.$$phase || $rootScope.$apply();

  init();

  return {
    isAuthenticated: isAuthenticated,
    getUserVisibleName: getUserVisibleName,
    getUserAvatar: getUserAvatar,
    login: login,
    logout: logout,
    onGraphUpdate: onGraphUpdate,
    newNote: newNote,
    updateTitle: updateTitle,
    updateBody: updateBody,
    updateParent: updateParent,
    onTitleUpdate: onTitleUpdate,
    onBodyUpdate: onBodyUpdate,
    trash: trash,
    backup: backup,
    restore: restore
  };
}

angular.module('dyanote').service('backend', backend);
