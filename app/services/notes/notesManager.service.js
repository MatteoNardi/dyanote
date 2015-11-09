
class notesManager {
  constructor (notesGraph, backend, notifications, openNotes, notesCoherenceTools) {
    this.notesGraph = notesGraph;
    this.notifications = notifications;
    this.backend = backend;
    this.notesCoherenceTools = notesCoherenceTools;

    // Keep the graph of notes updated
    backend.onGraphUpdate(notes => {
      notes.forEach(note => {
        notesGraph.setParent(note.id, note.parent);
        notesGraph.setTrashed(note.id, note.trashed);
      });

      if (openNotes.notes.length === 0)
        openNotes.open(R.head(notesGraph.roots()));
    });

    openNotes.addOpenHandler(note => this.load(note));
  }

  load (note) {
    this.loadTitle(note);
    this.loadBody(note);
  }

  loadBody (note) {
    if (this.notesGraph.body(note) === undefined)
      this.backend.onBodyUpdate(note, this.notesGraph.setBody(note));
  }

  loadTitle (note) {
    if (this.notesGraph.title(note) === undefined)
      this.backend.onTitleUpdate(note, this.notesGraph.setTitle(note));
  }

  loadAllTitles (cb) {
    this.notesGraph.allNotes().forEach(note => this.loadTitle(note));
  }

  newNote (parent, title) {
    title = title || "New note";
    var id = this.backend.newNote(parent, title);
    this.load(id);
    return id;
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
      parent = graph.parent(id);

    var toTrash = R.append(id, graph.descendants(id));
    if (parent)
      backend.updateBody(parent, this.notesCoherenceTools.removeLink(graph.body(parent), id));
    R.forEach(backend.trash, toTrash);

    // Show notification.
    var title = graph.title(id),
      children = toTrash.length -1;
    if (children)
      this.notifications.warn(`Note “${title}” and its ${children} sub-notes were moved to the trash`);
    else
      this.notifications.warn(`Note “${title}” was moved to the trash`);
  }
}

angular.module('dyanote').service('notesManager', notesManager);
