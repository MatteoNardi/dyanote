'use strict';

angular.module('dyanote')

// notesCoherenceTools is a stateless service which contains
// utility functions to enforce coherence in the notes set.
.service('notesCoherenceTools', function ($log) {
  // Todo: remove notsGraph dependency

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

  // renameLink changes the content of a link
  this.renameLink = function (note, targetNote, oldTitle) {
    var replacement = targetNote.title;
    if (!targetNote.title) replacement = '...';

    var body = note.body;
    var deadLinks = [];


    var regex = new RegExp('<a href="' + targetNote.url + '">([^<]*)<\/a>', 'g');
    var match;
    while ((match = regex.exec(body)) !== null)
    {
      // We don't rename links the user has manually changed (maybe he wants
      // the link text to be different to the linked page title)
      // If the link text is too short we assume an error has occurred
      // and the user wants the link text to be replaced.
      if(match[1] == oldTitle || match[1].length < 5)
        deadLinks.push(match[0]);
    }
    for (var i = 0; i < deadLinks.length; i++) {
      body = body.replace(deadLinks[i], '<a href="' + targetNote.url + '">' + replacement + '<\/a>');
    };
    note.body = body;
  }
});
