
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
    allNotes = _ => Array.from(_notes),
    callMethod = R.converge(R.bind, R.prop, R.nthArg(1)),
    setter = callMethod('set'),
    getter = callMethod('get'),
    setTitle = setter(_titles),
    setBody = setter(_bodies),
    parent = getter(_parents),
    title = getter(_titles),
    body = getter(_bodies),
    children = R.compose(Array.from, getter(_children));

  return {
    setParent: setParent, // id -> string -> null
    setTitle: setTitle,   // id -> string -> null
    setBody: setBody,     // id -> string -> null

    // Getters
    parent: parent,     // id -> id
    title: title,       // id -> string
    body: body,         // id -> string
    children: children, // id -> [id]
    allNotes: allNotes // [id]
  };
}

angular.module('dyanote').service('notesGraph', notesGraph);
