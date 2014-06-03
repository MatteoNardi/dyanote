'use strict';

// Define two scribe plugins: strong and em.
// Since most of the code is shared, we define a "formatting" generic plugin.

var formatting = function (tagname) {
  return function (scribe) {
    var utils = dyanote.scribe.utils;

    var command = scribe.commands[tagname] = {};

    // Executes the command.
    command.execute = function () {
      var analysis = command.analyze();
      var data = analysis.data;

      if (!analysis.enabled)
        return;

      scribe.transactionManager.run(function () {
        // Add formatting tag to all analysis.data.add elements
        for (var i = 0; i < data.add.length; i++) {
          var item = data.add[i];
          var element = document.createElement(tagname);
          item.el.insertBefore(element, item.el.childNodes[item.start]);
          for (var j = item.start; j < item.end; j++)
            element.appendChild(element.nextSibling);
        }
      });
    };

    command.queryState = function () {
    }

    command.queryEnabled = function () {
      return command.analyze().enabled;
    }

    // Analyzes the current selection and returns an object like this:
    // {
    //   enabled: wheather the command can be executed
    //   error: error message
    //   data: {
    //     add: [ {
    //       el: element where to insert tag
    //       start: start offset
    //       end: end offset
    //     }, ...],
    //     remove: [ list of elements to remove ]
    //   }
    // }
    command.analyze = function () {
      var range = window.getSelection().getRangeAt(0),
        A,
        B,
        add = [],
        rem = [];

      // Split start and end text nodes
      if (range.startContainer.nodeType == utils.TEXT_NODE &&
          range.endContainer.nodeType == utils.TEXT_NODE)
      {
        A = range.startContainer.splitText(range.startOffset);
        B = range.endContainer.splitText(range.endOffset).previousSibling;
      } else {
        throw 'A and B must be text nodes!'
      }

      var toProcess = [scribe.el];

      while (toProcess.length > 0) {
        var element = toProcess.shift();

        if (element == scribe.el || isFormatting(element)) {
          var toAddOffsets = [];
          for (var child = element.firstChild; child; child = child.nextSibling) {
            var posA = A.compareDocumentPosition(child);
            var posB = B.compareDocumentPosition(child);
            
            // Elements before range start or after range end should be ignored
            if (posA == utils.DOCUMENT_POSITION_PRECEDING || posB == utils.DOCUMENT_POSITION_FOLLOWING)
              continue;

            // If child is range start or end, add it.
            if (child == A || child == B)
              toAddOffsets.push(utils.getOffset(child));

            // If child contains extreme, process it later
            if ((posA | posB) & utils.DOCUMENT_POSITION_CONTAINS)
              toProcess.push(child);

            // If child is formatting and included between extremes, add it
            if (isFormatting(child) && 
                posA == utils.DOCUMENT_POSITION_FOLLOWING &&
                posB == utils.DOCUMENT_POSITION_PRECEDING)
            {
              toAddOffsets.push(utils.getOffset(child));
            }
          }

          // Add contiguous elements to result
          var start = undefined;
          for (var i = 0; i < toAddOffsets.length; i++) {
            if (start == undefined) {
              start = toAddOffsets[i];
            }
            if ((i > 0 && toAddOffsets[i] != toAddOffsets[i-1] + 1) ||
                 i == toAddOffsets.length -1)
            {

              add.push({
                el: element,
                start: start,
                end: (toAddOffsets[i-1] || start) + 1
              });
              start = toAddOffsets[i];
            }
          }
        }
      }

      return { 
        enabled: true,
        error: undefined,
        data: {
          add: add,
          rem: rem
        }
      };
    }
  };
}

// Returns true if node is a formatting node. 
var isFormatting = function (node) {
  return node.nodeType == node.ELEMENT_NODE &&
         (node.tagName == 'STRONG' || node.tagName == 'EM');
}

dyanote.scribe.commands.strong = formatting('strong');
dyanote.scribe.commands.em = formatting('em');

