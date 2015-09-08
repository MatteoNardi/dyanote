
// The store of notes.
// We try to follow the Flux pattern, this is the store of data and only
// the notesManager service should apply modifications.
function notesGraph () {
  let _notes = new Set(),  // Set <Id>
    _parents = new Map(),  // Map <Id, Id>
    _titles = new Map(),   // Map <Id, String>
    _children = new Map(), // Map <Id, Set<Id>>
    _bodies = new Map();   // Map <Id, String>

  let
    init = id => {
      if (id !== undefined && _children.get(id) === undefined) {
        _notes.add(id);
        _children.set(id, new Set());
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
      init(id);
      init(newParent);
      unlink(parent(id), id);
      link(newParent, id);
    },
    setTitle = D.setter(_titles),
    setBody = D.setter(_bodies),
    parent = D.getter(_parents),
    title = D.getter(_titles),
    body = D.getter(_bodies),
    children = R.compose(Array.from, D.getter(_children)),
    descendants = R.compose(R.flatten, D.dfs(children, children)),
    allNotes = _ => Array.from(_notes);

  return {
    setParent: setParent, // id -> string -> null
    setTitle: setTitle,   // id -> string -> null
    setBody: setBody,     // id -> string -> null

    // Getters
    parent: parent,     // id -> id
    title: title,       // id -> string
    body: body,         // id -> string
    children: children, // id -> [id]
    descendants: descendants, // [id]
    allNotes: allNotes  // [id]
  };
}

angular.module('dyanote').service('notesGraph', notesGraph);
