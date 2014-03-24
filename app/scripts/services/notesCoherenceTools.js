'use strict';

angular.module('dyanote')

// notesCoherenceTools is a stateless service which contains 
// utility functions to enforce coherence in the notes set.
.service('notesCoherenceTools', function ($log) {
  // Todo: remove notsGraph dependency

  // convertLink converts a temporary links in a note
  // to its definitive version. (Dyanote uses fake ids and fake links
  // when a new note is created and when the server acknowledges its
  // creation we need to update them.)
  this.convertLink = function (note, fakeUrl, realUrl) {
    while (note.body.indexOf(fakeUrl) != -1) {
      note.body = note.body.replace(fakeUrl, realUrl);
      $log.info("removeFakeLinks: replaced " + fakeUrl + " with " + realUrl);
    }
  };

  // removeLink removes a link from a note
  this.removeLink = function (note, link) {
    var body = note.body;
    var deadLinks = [];
    var replacements = [];


    var regex = new RegExp('<a href="' + link + '">([^<]*)<\/a>', 'g');
    var match;
    while ((match = regex.exec(body)) !== null)
    {
      deadLinks.push(match[0]);
      replacements.push(match[1])
    }
    for (var i = 0; i < deadLinks.length; i++) {
      $log.info("Removing dead link " + deadLinks[i] + " in note " + note.id);
      body = body.replace(deadLinks[i], replacements[i]);
    };
    note.body = body;
  };
});
