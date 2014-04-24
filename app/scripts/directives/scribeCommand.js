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

  // Returns the html currently selected in the browser.
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

  // Returns a tag free version of the given HTML.
  function removeTags (html) {
    var regex = /(<([^>]+)>)/ig;
    return html.replace(regex, "");
  }

  // Surrounds the given html with fake tags used to save and restore selection.
  function addSelectionTags (html) {
    var startTag = '<b class="selectionStart" display="none">...</b>';
    var endTag = '<b class="selectionEnd" display="none">...</b>';
    return startTag + html + endTag;
  }

  // Restores selection and removes the selection tags
  function restoreSelection () {
    var range = document.createRange();
    range.setStartAfter($('.selectionStart')[0]);
    range.setEndBefore($('.selectionEnd')[0]);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    // Delete selection tags
    $('.selectionStart, .selectionEnd').remove();
  }

  // Title command: h1 tag.
  // Execution will remove all contained tags.
  // Execution preserves selection.
  // Fixme: Should work on lines, not selected text.
  scribe.commands['title'] = (function () {
    // TODO: disable if selection spans multiple rows.
    // TODO: disable if selection is inside or contains links or lists.
    // TODO: If selected row already is a title, execute should remove it.
    var command = new scribe.api.SimpleCommand('insertHTML', 'h1');
    
    // Executes the command.
    command.execute = function () {
      if (this.queryState()) {

      } else {
        var html = getSelectionHtml();
        html = removeTags(html);
        html = '<h1>' + html + '</h1>';
        html = addSelectionTags(html);
        scribe.api.Command.prototype.execute.call(this, html);
        restoreSelection();
      }
    };

    command.queryState = function () {
    }
    
    return command;
  })();

  //scribe.commands['bold'] = formattingCommand('strong');
  //scribe.commands['italic'] = formattingCommand('em');
  //scribe.commands['title'] = formattingCommand('h1');
});