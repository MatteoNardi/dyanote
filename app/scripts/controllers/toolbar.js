'use strict';

angular.module('dyanote')

.controller('ToolbarCtrl', function ($scope, $log, notes) {
  // $scope.editor should be set by the note directive.

  // Create a link with the currently selected text.
  $scope.applyLink = function () {
    // If a single line is selected, that will be the title of the new note.
    // If multiple lines are selected, that will be the new note's body.
    var selection = $scope.editor.composer.selection.getSelection();
    var selectedText = $scope.editor.composer.selection.getText(); // Note: Doen't keep formatting
    var singleLine = selection.anchorNode === selection.focusNode && 
                     selection.anchorNode.nodeName == '#text' &&
                     selectedText.length < 20;
    var newNoteRequest = {
      title: singleLine ? selectedText : 'New note (' + (new Date()).toDateString() + ')',
      body: singleLine ? "" : selectedText,
      parentId: $scope.note.id
    }

    if(!singleLine) {
      $scope.editor.composer.commands.exec("delete");
      selection = $scope.editor.composer.selection.getSelection();
    }
    
    notes.newNote(newNoteRequest).then(function (note) {
      $log.info("New note created");
      $scope.$emit('$openNote', $scope.note.id, note.id);
      $scope.editor.composer.selection.setSelection(selection);
      $scope.editor.composer.commands.exec("createLink", { href: note.id, text: note.title });
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
