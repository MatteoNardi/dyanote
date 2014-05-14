'use strict';



// This is a Scribe plugin.
// This code is exported to the global namespace.
dyanote.scribe.commands.title = function (scribe) {

  var utils = dyanote.scribe.utils;

  // Title command: h1 tag.
  // Execution will remove all contained tags.
  // Execution preserves selection.
  // Works on lines, not selected text.
  // Is disabled if selection spans multiple rows.
  // Is disabled if selection is inside or contains links or lists.
  // TODO: If selected row already is a title, execute should remove it.
  var command = scribe.commands['title'] = {};

  // Executes the command.
  command.execute = function () {
    var analysis = command.analyze();
    var data = analysis.data;

    // If a title is selected, we undo it.
    var undoableElement = command.getUndoableTitle();
    if (undoableElement != undefined) {
      scribe.transactionManager.run(function () {
        utils.replaceWithChildren(undoableElement);
      });
    }

    if (!analysis.enabled)
      return;

    scribe.transactionManager.run(function () {
      var nodes = data.affectedNodes;
      var title = document.createElement('h1');
      var ancestor = data.ancestor;

      ancestor.insertBefore(title, ancestor.childNodes[data.offsetB]);
      
      // Remove containing STRONG and EM nodes
      var next;
      for (var n = ancestor; n != scribe.el; n = next) {
        next = n.parentNode;
        if (n.nodeType != utils.ELEMENT_NODE || ['STRONG', 'EM'].indexOf(n.tagName) == -1)
          throw 'Invalid ancestor';
        utils.replaceWithChildren(n);
      }

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].parentNode.removeChild(nodes[i]);
        title.appendChild(nodes[i]); 
      }
    });
  };

  command.queryState = function () {
    return command.getUndoableTitle() != undefined;
  }

  command.getUndoableTitle = function () {
    var range = window.getSelection().getRangeAt(0);
    var A = range.startContainer;
    var B = range.endContainer;
    var ancestor = range.commonAncestorContainer;

    var title = undefined
    if (ancestor.nodeType == utils.ELEMENT_NODE) {
      if (ancestor.tagName == 'H1')
        title = ancestor;

      if (range.endOffset - range.startOffset == 1 && 
          ancestor.childNodes[range.startOffset].tagName == 'H1')
      {
        title = ancestor.childNodes[range.startOffset];
      }
    } 
    return title;
  }

  // The title command can be executed only if a single line is selected.
  command.queryEnabled = function () {
    return command.analyze().enabled;
  }

  // Analyzes the current selection and returns an object like this:
  // {
  //   enabled: wheather the command can be executed
  //   error: error message
  //   data: {
  //     affectedNodes: array of text nodes affected by command
  //     ancestor: ancestor node
  //     offsetA: offsetA
  //     offsetB: offsetB
  //   }
  // }
  command.analyze = function () {
    var range = window.getSelection().getRangeAt(0);
    var A = range.startContainer;
    var B = range.endContainer;
    var ancestor = range.commonAncestorContainer;
    var affectedNodes = [];

    // Utility functions used in the algorithm.

    // Make sure no invalid node is contained in descendants of node
    var checkAllDescendants = function (node) {
      switch (node.nodeType) {
        case utils.TEXT_NODE:
          affectedNodes.push(node);
          break;
        case utils.ELEMENT_NODE:
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

      return checkUp (node.parentNode, utils.getOffset(node), step, ancestor);
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
        return findUp (node.parentNode, utils.getOffset(node), step);
    }

    // Returns true if line break is found.
    // Throws excetion if invalid tag is found
    var findDown = function (node, step) {
      if (node.nodeType == utils.TEXT_NODE) {
        affectedNodes.push(node);
        return false;
      }
      else if (node.nodeType != utils.ELEMENT_NODE)
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


    // Execution
    try {
      // Check range extremes are contained in the scribe editor.
      if (!scribe.el.contains(A))
        throw 'Extreme A is out of Scribe editor';
      if (!scribe.el.contains(B))
        throw 'Extreme B is out of Scribe editor';
      
      checkAllDescendants(A.childNodes[range.startOffset]);
      checkAllDescendants(B.childNodes[range.endOffset -1]);

      var offsetA = checkUp(A, range.startOffset, +1, ancestor);
      var offsetB = checkUp(B, range.endOffset,   -1, ancestor);

      // Check all descendants of ancestor between A and B
      for (var i = offsetA + 1; i < offsetB - 1; i++) {
        checkAllDescendants(ancestor.childNodes[i]);
      }

      // Enlarge selection to include all line
      findUp(A, range.startOffset, -1);
      findUp(B, range.endOffset, +1);



      return {
        enabled: true,
        error: undefined,
        data: {
          ancestor: ancestor,
          affectedNodes: utils.sort(affectedNodes),
          offsetA: offsetA,
          offsetB: offsetB
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
