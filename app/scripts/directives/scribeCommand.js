'use strict';

angular.module('dyanote')

// Execute a command on the Scribe editor
.directive('scribeCommand', function ($window, $log) {

  var getFocusedEditor = function () {
    var selection = $window.getSelection();
    if (selection) {
      var editor = $(selection.anchorNode).closest('.richTextEditor');
      if (editor.length > 0)
        return editor[0].scribe;
    }
    return undefined;
  }

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.on('click', function (event) {
        
        var scribe = getFocusedEditor();
        if (scribe)
          scribe.commands[attrs.scribeCommand].execute();
        else
          $log.warn('No text selected');
      })
    }
  };
})

// This is our plugin to Scribe.
.constant('dyanoteScribePlugin', function (scribe) {

  // Todo: remove this
  function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
  }

  // Return a Scribe command formatting the given tag.
  var formattingCommand = function (tag) {
    var command = new scribe.api.SimpleCommand('insertHTML', 'asdasd');
    
    // Executes the command.
    command.execute = function () {
      if (this.queryState()) {
        scribe.commands['formatBlock'].execute('<p>');
        // Does this work?
        //scribe.api.Command.prototype.execute.call(this, '<p>');
      } else {
        var html = '<' + tag + '>' + getSelectionHtml() + '</' + tag + '>';
        scribe.api.Command.prototype.execute.call(this, html);
      }
    };
    
    return command;
  }

  scribe.commands['bold'] = formattingCommand('strong');
  scribe.commands['italic'] = formattingCommand('em');
  scribe.commands['title'] = formattingCommand('h1');
});