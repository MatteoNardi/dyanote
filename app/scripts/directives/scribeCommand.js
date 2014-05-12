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

  // Constants
  var TEXT_NODE = 3,
    ELEMENT_NODE = 1;

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

  // Given a node, returns its offset relative to its parent.
  var getOffset = function (node) {
    for (var nodeOffset = 0; nodeOffset < node.parentNode.childNodes.length; nodeOffset++)
      if (node.parentNode.childNodes[nodeOffset] == node)
        return nodeOffset;
    throw 'getOffset failed: child not found in parent';
  }

  // Title command: h1 tag.
  // Execution will remove all contained tags.
  // Execution preserves selection.
  // Fixme: Should work on lines, not selected text.
  // TODO: disable if selection spans multiple rows.
  // TODO: disable if selection is inside or contains links or lists.
  // TODO: If selected row already is a title, execute should remove it.
  // TODO: Close unclosed tags, open unopened tags.
  scribe.commands['title'] = (function () {
    var command = {};

    // Executes the command.
    command.execute = function () {
      if (!command.queryEnabled())
        return;
      console.log("running command");
      scribe.transactionManager.run(function () {
        // TODO
      }.bind(this));
    };

    command.queryState = function () {
    }

    // The title command can be executed only if a single line is selected.
    command.queryEnabled = function () {
      return command.queryEnabledWithReason ()[0];
    }

    // Returns [true, undefined] if the command can be executed,
    // Returns [false, 'failure reason'] if it can't.
    command.queryEnabledWithReason = function () {
      var range = window.getSelection().getRangeAt(0);
      var A = range.startContainer;
      var B = range.endContainer;
      var ancestor = range.commonAncestorContainer;

      var checkAllDescendants = function (node) {
        switch (node.nodeType) {
          case TEXT_NODE:
            break;
          case ELEMENT_NODE:
            switch (node.tagName) {
              case 'STRONG':
              case 'EM':
                for (var child = node.firstChild; child != null; child = child.nextSibling)
                  checkAllDescendants(child);
                break;
              default:
                throw 'Invalid tag inside selection: ' + node.tagName;
            }
            break;
          default:
            throw 'Unknown node type: ' + node.nodeType;        
        }
      }

      // Returns the offset of the checked subtree relative to the ancestor.   
      // Throws excetion if invalid node is found.
      var checkUp = function (node, offset, step) {
        // console.log(node);
        // console.log(node.tagName + ' (' + offset + ') ' + step);
        if (node == ancestor)
          return offset;
        
        for (var i = offset + step; i >= 0 && i < node.childNodes.length; i += step)
          checkAllDescendants(node.childNodes[i]);

        return checkUp (node.parentNode, getOffset(node), step);
      }



      // Search up for a line-breaking tag in order to expand selection to line.
      // Throws excetion if invalid node is found (outside selection)
      var findUp = function (node, offset, step) {
        // Since checkUp has already been execuded, we cas assume node is
        // either STRONG, EM or scribe.el

        for (var i = offset + step; i >= 0 && i < node.childNodes.length; i += step) {
          if (findDown(node.childNodes[i], step))
            return;
        }

        if (node != scribe.el)
          return findUp (node.parentNode, getOffset(node), step);
      }

      // Returns true if line break is found.
      // Throws excetion if invalid tag is found
      var findDown = function (node, step) {
        if (node.nodeType == TEXT_NODE)
          return false;
        else if (node.nodeType != ELEMENT_NODE)
          throw 'Unknown node type inside line: ' + node.nodeType;
        else if (['BR', 'UL', 'H1'].indexOf(node.tagName) != -1)
          return true;
        else if (['STRONG', 'EM'].indexOf(node.tagName) != -1) {
          var len = node.childNodes.length;
          for (var i = len + step; i < len && i > -len; i += step) {
            var child = node.childNodes[i % len];
            if (findDown (child, step))
              return true;
          }
          return false;
        }
        else throw 'Invalid tag inside line: ' + node.tagName;
      }

      try {
        // Check range extremes are contained in the scribe editor.
        if (!scribe.el.contains(A))
          throw 'Extreme A is out of Scribe editor';
        if (!scribe.el.contains(B))
          throw 'Extreme B is out of Scribe editor';
        
        checkAllDescendants(A.childNodes[range.startOffset]);
        checkAllDescendants(B.childNodes[range.endOffset -1]);

        var offsetA = checkUp(A, range.startOffset, +1);
        var offsetB = checkUp(B, range.endOffset, -1);

        // Check all descendants of ancestor between A and B
        for (var i = offsetA + 1; i < offsetB - 1; i++) {
          checkAllDescendants(ancestor.childNodes[i]);
        }

        // Enlarge selection to include all line
        findUp(A, range.startOffset, -1);
        findUp(B, range.endOffset, +1);

        return [true, undefined];
      } catch (error) {
        return [false, error];
      }

      // The nodes affected are all the nodes between our range extremes plus
      // all nodes to their right and left until a block element (br, ul, h1)
      var affectedNodes = [];
      var i = range.startContainer;
      //console.log(range);
      // if (i.nodeType != 3)
      //   return false;

      // if (affectedNodes.parents.contain('ul')) return false;
      // if (affectedNodes.contain('a', 'ul', 'li', 'br')) return false;

      return [true, undefined];
      // body...
    };
    
    return command;
  })();

  //scribe.commands['bold'] = formattingCommand('strong');
  //scribe.commands['italic'] = formattingCommand('em');
  //scribe.commands['title'] = formattingCommand('h1');
});