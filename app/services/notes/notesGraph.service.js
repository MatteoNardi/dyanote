
// The store of notes.
// We try to follow the Flux pattern, this is the store of data and only
// the notesManager service should apply modifications.
function notesGraph () {
  let _notes = new Set(),  // Set <Id>
    _parents = new Map(),  // Map <Id, Id>
    _titles = new Map(),   // Map <Id, String>
    _children = new Map(), // Map <Id, Set<Id>>
    _bodies = new Map(),   // Map <Id, String>
    _trashed = new Map();  // Map <Id, Boolean>

  let
    init = id => {
      if (id !== undefined && _children.get(id) === undefined) {
        _notes.add(id);
        _children.set(id, new Set());
        _trashed.set(id, false);
      }
    },
    link = (source, dest) => {
      _parents.set(dest, source);
      if (source !== undefined)
        _children.get(source).add(dest);
    },
    unlink = (source, dest) => {
      _parents.set(dest, null);
      if (source !== undefined)
        _children.get(source).delete(dest);
    },
    setParent = (id, newParent) => {
      if (newParent === '')
        newParent = undefined;
      init(id);
      init(newParent);
      unlink(parent(id), id);
      link(newParent, id);
    },
    setTitle = D.setter(_titles),
    setBody = D.setter(_bodies),
    setTrashed = D.setter(_trashed),
    parent = D.getter(_parents),
    title = D.getter(_titles),
    body = D.getter(_bodies),
    notTrashed = R.compose(R.not, D.getter(_trashed)),
    allChildren = R.compose(Array.from, D.getter(_children)),
    children = R.compose(R.filter(notTrashed), allChildren),
    descendants = R.compose(R.flatten, D.dfs(children, children)),
    allNotes = _ => Array.from(_notes),
    allTrashed = _ => R.filter(D.getter(_trashed))(allNotes()),
    hasNoParent = R.compose(R.not, D.exists, parent),
    isRoot = R.both(hasNoParent, notTrashed),
    roots = _ => R.filter(isRoot, allNotes());

  return {
    setParent: setParent, // id -> id -> null
    setTitle: setTitle,   // id -> string -> null
    setBody: setBody,     // id -> string -> null
    setTrashed: setTrashed, // id -> string -> null

    // Getters
    parent: parent,     // id -> id
    title: title,       // id -> string
    body: body,         // id -> string
    children: children, // id -> [id]
    descendants: descendants, // [id]
    allNotes: allNotes,       // [id]
    allTrashed: allTrashed,   // [id]
    roots: roots              // [id]
  };
}

angular.module('dyanote').service('notesGraph', notesGraph);
