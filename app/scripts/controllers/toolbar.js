'use strict';

angular.module('dyanote')

// ToolbarCtrl is the controller of the toolbar and is tightly coupled with Scribe.
// When a toolbar button is clicked, we update our rich text editor accordingly.
// $scope.scribe must be set to the currently focused editor.
.controller('ToolbarCtrl', function ($scope, $log, notesManager) {


  /**
   * All: Executing a heading command inside a list element corrupts the markup.
   * Disabling for now.
   */
  boldCommand.queryEnabled = function () {
    var selection = new scribe.api.Selection();
    var listNode = selection.getContaining(function (node) {
      return node.nodeName === 'OL' || node.nodeName === 'UL';
    });

    return scribe.api.Command.prototype.queryEnabled.apply(this, arguments)
      && scribe.allowsBlockElements() && ! listNode;
  };

  // Returns the currently focused editor
  var getScribe = function () {
    console.log($scope.scribe)
    // TODO: fail if scope.scribe doesnt contain window.getSelection()
    if ($scope.scribe)
      return $scope.scribe
    else 
      throw 'No scribe editor focused';
  }

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
    var scribe = getScribe();
    scribe.transactionManager.run(function () {
      var selection = new scribe.api.Selection();
      if (!! selection.getContaining(function (node) {
        return node.nodeName === nodeName;
      })) {
        scribe.api.Command.prototype.execute.call(this, '<p>');
      } else {
        scribe.api.Command.prototype.execute.call(this, '<strong>');
        
      }
    });
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
