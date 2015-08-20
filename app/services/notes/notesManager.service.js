
class notesManager {
  constructor (notesGraph, backend, notifications) {
    this.notesGraph = notesGraph;

    // Keep the graph of notes updated
    backend.onGraphUpdate(graph => {
      for (let note in graph)
        notesGraph.setParent(note, graph[note]);
    });

    backend.onTitleUpdate(notesGraph.setTitle);
    backend.onBodyUpdate(notesGraph.setBody);
  }

  newNote (parent, title) {
    title = title || "New note";
    id = backend.newNote(parent, id);

    this.notesGraph.setTitle(id, title);
    this.notesGraph.setParent(id, parent);
    this.notesGraph.setBody(id, "");
  }

  setTitle (id, title) {
    // notesCoherenceTools.renameLink(note.parent, note, oldTitle);
    this.notesGraph.setTitle(id, title);
  }

  setBody (id, body) {
    // TODO: check if all children are still present and move to
    // lost&found the ones which are not.
    this.notesGraph.setBody(id, body);
  }

  archiveNote (id) {
    // notifications.warn('"' + note.title + '" was moved to "' + note.parent.title + '"');
    // notesCoherenceTools.removeLink(oldParent, note.url);
  }
}

angular.module('dyanote').service('notesManager', notesManager);
