
// notesCoherenceTools is a stateless service which contains
// utility functions to enforce coherence in the notes set.
class notesCoherenceTools {

  constructor () {
    this.linkRegex = id => new RegExp(`<a href="#${id}">([^<]*)<\/a>`, 'g');
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
}

angular.module('dyanote').service('notesCoherenceTools', notesCoherenceTools);
