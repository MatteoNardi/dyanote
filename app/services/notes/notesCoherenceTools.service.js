
// notesCoherenceTools is a stateless service which contains
// utility functions to enforce coherence in the notes set.
class notesCoherenceTools {

  // removeLink removes a link from a note
  removeLink (body, id) {
    let regex = new RegExp(`<a href="#${id}">([^<]*)<\/a>`, 'g');
    return body.replace(regex, '$1');
  }

  // renameLink changes the content of a link
  renameLink (body, id, newTitle) {
    newTitle = newTitle || '...';
    let regex = new RegExp(`<a href="#${id}">([^<]*)<\/a>`, 'g');
    return body.replace(regex, `<a href="#${id}">${newTitle}</a>`);
  }
}

angular.module('dyanote').service('notesCoherenceTools', notesCoherenceTools);
