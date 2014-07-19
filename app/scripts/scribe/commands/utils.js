'use strict';

dyanote.scribe.utils = {
  // Node type constants
  TEXT_NODE: 3,
  ELEMENT_NODE: 1,
  COMMENT_NODE: 8,

  // compareDocumentPosition return value mask constants
  DOCUMENT_POSITION_DISCONNECTED:  1,
  DOCUMENT_POSITION_PRECEDING: 2,
  DOCUMENT_POSITION_FOLLOWING: 4,
  DOCUMENT_POSITION_CONTAINS:  8,
  DOCUMENT_POSITION_CONTAINED_BY:  16,
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,


  // Returns the html currently selected in the browser.
  getSelectionHtml: function() {
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
  },
  
  // Returns a tag free version of the given HTML.
  removeTags: function (html) {
    var regex = /(<([^>]+)>)/ig;
    return html.replace(regex, "");
  },

  // Surrounds the given html with fake tags used to save and restore selection.
  addSelectionTags: function (html) {
    var startTag = '<b class="selectionStart" display="none">...</b>';
    var endTag = '<b class="selectionEnd" display="none">...</b>';
    return startTag + html + endTag;
  },

  // Restores selection and removes the selection tags
  restoreSelection: function () {
    var range = document.createRange();
    range.setStartAfter($('.selectionStart')[0]);
    range.setEndBefore($('.selectionEnd')[0]);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    // Delete selection tags
    $('.selectionStart, .selectionEnd').remove();
  },

  // Given a node, returns its offset relative to its parent.
  getOffset: function (node) {
    for (var nodeOffset = 0; nodeOffset < node.parentNode.childNodes.length; nodeOffset++)
      if (node.parentNode.childNodes[nodeOffset] == node)
        return nodeOffset;
    throw 'getOffset failed: child not found in parent';
  },

  // Given an array of nodes, sort them by order in DOM
  sort: function (nodes) {
    nodes.sort(function (a, b) {
      var res = a.compareDocumentPosition(b); 
      if (res & Node.DOCUMENT_POSITION_FOLLOWING)
        return -1;
      else if (res & Node.DOCUMENT_POSITION_PRECEDING)
        return 1;
      else if (res == 0)
        return 0;
      else {
        console.log(res);
        console.log(a)
        console.log(b)
        throw 'Impossible to sort affectedNodes';
      }
    });
    return nodes;
  },

  // Remove node from its parent and replace it with all its children.
  replaceWithChildren: function (node) {
    var next;
    for (var child = node.firstChild; child != null; child = next) {
      next = child.nextSibling;
      node.removeChild(child);
      node.parentNode.insertBefore(child, node);
    }
    node.parentNode.removeChild(node);
  },

  // Return the currently selected range forcing text node extremes.
  getRange: function () {
    var selection = window.getSelection(),
      range = selection.getRangeAt(0),
      root = range.commonAncestorContainer,
      result = document.createRange(),
      insideSelection = function (node) {
        if (selection.containsNode(node))
          return NodeFilter.FILTER_ACCEPT
        else
          return NodeFilter.FILTER_SKIP;        
      },
      walker = document.createTreeWalker(
        root, NodeFilter.SHOW_TEXT, { acceptNode: insideSelection }
      );

    if (range.startContainer.nodeType == dyanote.scribe.utils.TEXT_NODE)
      result.setStart(range.startContainer, range.startOffset);
    else
      result.setStart(walker.firstChild(), 0);

    if (range.endContainer.nodeType == dyanote.scribe.utils.TEXT_NODE)
      result.setEnd(range.endContainer, range.endOffset);
    else
      result.setEnd(walker.lastChild() || walker.currentNode, walker.currentNode.length);

    return result;
  }
}


