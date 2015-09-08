
class notesManager {
  constructor (notesGraph, backend, notifications, openNotes, notesCoherenceTools) {
    this.notesGraph = notesGraph;
    this.notifications = notifications;
    this.backend = backend;
    this.notesCoherenceTools = notesCoherenceTools;
    this.loaded = new Set();

    // Keep the graph of notes updated
    backend.onGraphUpdate(graph => {
      var rootNote;
      for (let note in graph) {
        if (!graph[note] && !rootNote)
          rootNote = note;
        notesGraph.setParent(note, graph[note]);
      }

      if (openNotes.notes.length === 0)
        openNotes.open(rootNote);
    });

    openNotes.addOpenHandler(note => this.load(note));
  }

  load (note) {
    if (!this.loaded.has(note)) {
      this.loaded.add(note);
      this.backend.onTitleUpdate(note, title => this.notesGraph.setTitle(note, title));
      this.backend.onBodyUpdate(note, body => this.notesGraph.setBody(note, body));
    }
  }

  newNote (parent, title) {
    title = title || "New note";
    return this.backend.newNote(parent, title);
  }

  setTitle (id, title) {
    // notesCoherenceTools.renameLink(note.parent, note, oldTitle);
    this.backend.updateTitle(id, title);
  }

  setBody (id, body) {
    // TODO: check if all children are still present and move to
    // lost&found the ones which are not.
    this.backend.updateBody(id, body);
  }

  trashNote (id) {
    var graph = this.notesGraph,
      backend = this.backend,
      parent = graph.parent(id),
      removeLink = this.notesCoherenceTools.removeLink;

    var toArchive = R.append(id, notesGraph.descendants(id));
    backend.updateBody(parent, removeLink(graph.body(parent), id));
    toArchive.forEach(backend.trash);

    // Show notification.
    var title = graph.title(id),
      children = toArchive.length -1;
    if (children)
      this.notifications.warn(`Note “${title}” and its ${children} sub-notes have been  archived`);
    else
      this.notifications.warn(`Note “${title}” has been  archived`);

  }
}

angular.module('dyanote').service('notesManager', notesManager);
