'use strict';

angular.module('dyanote')

// ToolbarCtrl is the controller of the toolbar and is tightly coupled with WysiHTML5.
// When a toolbar button is clicked, we update our rich text editor accordingly.
// $scope.editor must be set by the note directive.
.controller('ToolbarCtrl', function ($scope, $log, notesManager) {

  // Create a link with the currently selected text.
  $scope.applyLink = function () {
    $scope.editor.focus();
    var parent, title, body;
    
    var composer = $scope.editor.composer;
    var selection = composer.selection.getSelection();
    var range = composer.selection.getRange();

    // If a single line is selected, that will be the title of the new note.
    // If multiple lines are selected, that will be the new note's body.
    var isSingleLine = selection.anchorNode === selection.focusNode && 
                       selection.anchorNode.nodeName == '#text' &&
                       selection.toString().length < 20;
    isSingleLine = true; // Force single line until we fix bugs
    
    parent = $scope.note;
    if(isSingleLine) {
      // Make the selected text (without formatting) as the title
      title = selection.toString();
      body = '';
    } else {
      title = 'New note (' + (new Date()).toDateString() + ')';
      body = selection.toHtml();
      composer.commands.exec('delete');
    }
    var note = notesManager.newNote(parent, title, body);
    console.log(note);

    composer.commands.exec('createLink', { href: note.url, text: note.title });
    $log.info('New note created (' + note.id + '): ' + note.title
              + (isSingleLine ? ' [Single line]' : ' [Multi line]'));
    $scope.$emit('$openNote', $scope.note.id, note.id);
  }

  // Make currently selected text bold.
  $scope.applyBold = function () {
    $scope.editor.focus();
    $scope.editor.composer.commands.exec('formatInline', 'strong');
  }

  // Make currently selected text italic.
  $scope.applyItalic = function () {
    $scope.editor.focus();
    $scope.editor.composer.commands.exec('formatInline', 'em');
  }
  
  // Make currently selected text a title.
  $scope.applyTitle = function () {
    $scope.editor.focus();
    $scope.editor.composer.commands.exec('formatBlock', 'h1');
  }

  // Insert unordered list.
  $scope.addList = function () {
    $scope.editor.focus();
    var composer = $scope.editor.composer;
    var selection = composer.selection;
    if (selection.getSelection().isCollapsed)
      selection.selectNode(selection.getSelectedNode());
    // TODO: Keep bold/italic formatting, strip other tags
    // TODO: make a <li> for each selected line
    var content = selection.getText();
    var html = '<ul><li>' + content + '</li></ul>'
    console.log(html);

    composer.commands.exec('delete');
    composer.commands.exec('insertHTML', html);
  }
});
