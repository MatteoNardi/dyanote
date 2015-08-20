
// The store of notes.
// We try to follow the Flux pattern, this is the store of data and only
// the notesManager service should apply modifications.
class notesGraph {

  constructor () {
    this.parents = new Map(); // Map <Id, Id>
    this.titles = new Map(); // Map <Id, String>
    this.children = new Map(); // Map <Id, Set<Id>>
    this.bodies = new Map(); // Map <Id, String>
  }

  setParent (id, parent) {
    this.unlink(id, this.parent(id));
    this.link(id, parent);
  }

  setTitle (id, title) {
    this.titles.set(id, title);
  }

  setBody (id, body) {
    this.bodies.set(id, body);
  }

  delete (id) {
    // TODO
  }

  // Getters
  parent (id) { return this.parents.get(id); }
  title (id) { return this.titles.get(id); }
  body (id) { return this.bodies.get(id); }
  children (id) { return this.children.get(id); }

  // Private
  link (parent, child) {
    this.parents.set(parent, child);
    this.children.get(parent).add(child);
  }

  unlink (parent, child) {
    this.parents.set(parent, null);
    this.children.get(parent).delete(child);
  }
}

angular.module('dyanote').service('notesGraph', notesGraph);
