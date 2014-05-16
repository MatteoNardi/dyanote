'use strict';



// Scribe plugin for linking to new notes.
// Expectations:
// Executing command when link is selected won't do anything.
// Todo: when multiple lines are selected, put their content in new note
dyanote.scribe.commands.link = function (scribe) {

  var utils = dyanote.scribe.utils;

  var command = scribe.commands['link'] = {};

  // Executes the command.
  command.execute = function () {
    var analysis = command.analyze();
    var data = analysis.data;
    // console.log(analysis);
    // return;

    if (!analysis.enabled)
      return;

    scribe.transactionManager.run(function () {
      var $scope = angular.element(scribe.el).scope()
      var injector = angular.element(document).injector();
      var notesManager = injector.get('notesManager');
      
      var parent = $scope.note;
      // Make the selected text (without formatting) as the title
      var title = data.title;
      var body = '';

      var note = notesManager.newNote(parent, title, body);

      document.execCommand("createLink", false, note.url);

      $scope.$emit('$openNote', $scope.note.id, note.id);
    });
  };

  command.queryState = function () {
    // Clicking link two times won't undo it.
    return false;
  }

  command.queryEnabled = function () {
    return command.analyze().enabled;
  }

  // Analyzes the current selection and returns an object like this:
  // {
  //   enabled: wheather the command can be executed
  //   error: error message
  //   data: {
  //   }
  // }
  command.analyze = function () {
    var range = window.getSelection().getRangeAt(0);
    var A = range.startContainer;
    var B = range.endContainer;
    var startOffset = range.startOffset;
    var endOffset = range.endOffset;
    var ancestor = range.commonAncestorContainer;
    var affectedNodes = [];

    // We want A and B to be ELEMENT nodes.
    if (A.nodeType == utils.TEXT_NODE) {
      startOffset = utils.getOffset(A);
      A = A.parentNode;
    }
    if (B.nodeType == utils.TEXT_NODE) {
      endOffset = utils.getOffset(B) + 1;
      B = B.parentNode;
    }
    if (ancestor.nodeType == utils.TEXT_NODE) {
      ancestor = ancestor.parentNode;
    }


    // Execution
    try {
      // Check range extremes are contained in the scribe editor.
      if (!scribe.el.contains(A))
        throw 'Extreme A is out of Scribe editor';
      if (!scribe.el.contains(B))
        throw 'Extreme B is out of Scribe editor';
      
      /*
      checkAllDescendants(A.childNodes[startOffset]);
      checkAllDescendants(B.childNodes[endOffset -1]);

      var offsetA = checkUp(A, startOffset, +1, ancestor);
      var offsetB = checkUp(B, endOffset,   -1, ancestor);

      // Check all descendants of ancestor between A and B
      for (var i = offsetA + 1; i < offsetB - 1; i++) {
        checkAllDescendants(ancestor.childNodes[i]);
      }
      */

      return {
        enabled: true,
        error: undefined,
        data: {
          title: range.toString()
        }
      };
    } catch (error) {
      return {
        enabled: false,
        error: error,
        data: undefined
      };
    }
  };
};
