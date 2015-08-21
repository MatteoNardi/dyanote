
// The store of notes.
// We try to follow the Flux pattern, this is the store of data and only
// the notesManager service should apply modifications.
class notesGraph {

  constructor () {
    this._parents = new Map(); // Map <Id, Id>
    this._titles = new Map(); // Map <Id, String>
    this._children = new Map(); // Map <Id, Set<Id>>
    this._bodies = new Map(); // Map <Id, String>
  }

  setParent (id, parent) {
    this.init(id);
    this.init(this.parent(id));
    this.init(parent);
    this.unlink(this.parent(id), id);
    this.link(parent, id);
  }

  init (id) {
    if (this._children.get(id) === undefined)
      this._children.set(id, new Set());
  }

  setTitle (id, title) {
    this._titles.set(id, title);
  }

  setBody (id, body) {
    this._bodies.set(id, body);
  }

  delete (id) {
    // TODO
  }

  // Getters
  parent (id) { return this._parents.get(id); }
  title (id) { return this._titles.get(id); }
  body (id) { return this._bodies.get(id); }
  children (id) { return this._children.get(id); }

  // Private
  link (parent, child) {
    this._parents.set(child, parent);
    this._children.get(parent).add(child);
  }

  unlink (parent, child) {
    this._parents.set(child, null);
    this._children.get(parent).delete(child);
  }
}

angular.module('dyanote').service('notesGraph', notesGraph);
