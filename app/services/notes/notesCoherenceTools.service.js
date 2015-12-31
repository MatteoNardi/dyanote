
// notesCoherenceTools is a stateless service which contains
// utility functions to enforce coherence in the notes set.
class notesCoherenceTools {

  constructor () {
    this.linkRegex = id => (new RegExp(`<a href="#${id}">([^<]*)<\/a>`, 'g'));
  }

  // removeLink removes a link from a note
  removeLink (body, id) {
    return body.replace(this.linkRegex(id), '$1');
  }

  // renameLink changes the content of a link
  renameLink (body, id, newTitle) {
    newTitle = newTitle || '...';
    return body.replace(this.linkRegex(id), `<a href="#${id}">${newTitle}</a>`);
  }

  // Sometimes (on copy&paste for example), note links (which use anchors)
  // become full links. This function detects and fixes this.
  // ... http://localhost:8000/notes/view#-K6rJ4JnnTpGIV4AncFu ...
  // ... #-K6rJ4JnnTpGIV4AncFu ...
  forceLocalLinks (body, notesIds) {
    return body.replace(/href="[^"]*#([-\w]+)"/g, (match, id) =>
      notesIds.indexOf(id) === -1 ? match : `href="#${id}"`
    );
  }
}

angular.module('dyanote').service('notesCoherenceTools', notesCoherenceTools);
