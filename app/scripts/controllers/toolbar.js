'use strict';

angular.module('dyanote')

// ToolbarCtrl is the controller of the toolbar and is tightly coupled with WysiHTML5.
// When a toolbar button is clicked, we update our rich text editor accordingly.
// $scope.editor must be set by the note directive.
.controller('ToolbarCtrl', function ($scope, $log, notes) {

  // Create a link with the currently selected text.
  $scope.applyLink = function () {
    
    var newNoteRequest = {
      title: '',
      body: '',
      parentId: $scope.note.id
    }
    
    var composer = $scope.editor.composer;
    var selection = composer.selection.getSelection();
    var range = composer.selection.getRange();

    // If a single line is selected, that will be the title of the new note.
    // If multiple lines are selected, that will be the new note's body.
    var isSingleLine = selection.anchorNode === selection.focusNode && 
                       selection.anchorNode.nodeName == '#text' &&
                       selection.toString().length < 20;
    
    if(isSingleLine) {
      // Make the selected text (without formatting) as the title
      newNoteRequest.title = selection.toString();
    } else {
      newNoteRequest.title = 'New note (' + (new Date()).toDateString() + ')';
      newNoteRequest.body = selection.toHtml();
    }
    
    notes.newNote(newNoteRequest).then(function (note) {
      $log.info('New note created (' + note.id + '): ' + note.title
                + (isSingleLine ? ' [Single line]' : ' [Multi line]'));
      $scope.$emit('$openNote', $scope.note.id, note.id);
      composer.selection.setSelection(range);
      if (!isSingleLine) {
        composer.commands.exec("delete");
        selection = composer.selection.getSelection();
      }
      composer.commands.exec("createLink", { href: note.url, text: note.title });
    }, function (error) {
      $log.error('Error creating note: ' + error);
    });

  }

  // Make currently selected text bold.
  $scope.applyBold = function () {
    $scope.editor.composer.commands.exec("bold");
  }

  // Make currently selected text italic.
  $scope.applyItalic = function () {
    $scope.editor.composer.commands.exec("italic");
  }
   
});
