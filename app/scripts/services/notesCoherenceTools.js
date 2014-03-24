'use strict';

angular.module('dyanote')

// notesCoherenceTools is a stateless service which contains 
// utility functions to enforce coherence in the notes set.
.service('notesCoherenceTools', function ($log, notesGraph) {
  // Todo: remove notsGraph dependency

  // removeFakeLinks converts all the temporary links in a note
  // to their definitive version. (Dyanote uses fake ids and fake links
  // when a new note is created and when the server acknowledges its
  // creation we need to update them.)
  this.removeFakeLinks = function (note) {
    var containsFakeLinks = note.body.indexOf('templink') != -1;
    while (containsFakeLinks) {
      var match = note.body.match(/https:\/\/dyanote\.com\/templink\/(\d+)\//);
      var fakeId = match[1];
      var fakeUrl = match[0];
      var realUrl = notesGraph.getById(fakeId).url;
      if (realUrl.indexOf('templink') == -1) {
        note.body = note.body.replace(fakeUrl, realUrl);
        $log.info("removeFakeLinks: replaced " + fakeUrl + " with " + realUrl);

        containsFakeLinks = note.body.indexOf('templink') != -1;
      } else {
        break;
      }
    }
  };

  // removeDeadLinks removes from a note all the links to
  // archived notes.
  this.removeDeadLinks = function (note) {
    // Search all dead links.
    var deadLinks = [];
    var replacements = [];
    var body = note.body;
    var regex = /<a href="[^"]+\/(\d+)\/">([^<]*)<\/a>/g;
    var match;
    while ((match = regex.exec(body)) !== null)
    {
      if (notesGraph.getById(match[1]).parent !== note) {
        deadLinks.push(match[0]);
        replacements.push(match[2])
      }
    }
    for (var i = 0; i < deadLinks.length; i++) {
      $log.info("Removing dead link " + deadLinks[i] + " in note " + note.id);
      body = body.replace(deadLinks[i], replacements[i]);
    };
    note.body = body;
  };

});
