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

        // Remove formatting to all analysis.data.rem elements
        for (var i = 0; i < data.rem.length; i++) {
          utils.replaceWithChildren(data.rem[i]);
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
      var range = utils.getRange(),
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

        if (element == scribe.el || isFormatting(element) || element.tagName == 'LI') 
        {
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

            // If child is list, process it later
            if (child.tagName && child.tagName == 'UL')
              toProcess.push(child);

            // If child contains extreme, process it later
            if ((posA | posB) & utils.DOCUMENT_POSITION_CONTAINS)
              toProcess.push(child);

            // If child is included between extremes, consider it
            if (posA == utils.DOCUMENT_POSITION_FOLLOWING &&
                posB == utils.DOCUMENT_POSITION_PRECEDING)
            {
              // If is our formatting, remove it
              if (child.tagName == tagname.toUpperCase())
                rem.push(child);

              // If it is text or some other formatting, add it
              else if (child.nodeType == utils.TEXT_NODE || isFormatting(child))
                toAddOffsets.push(utils.getOffset(child));
            }
          }
          // Add contiguous elements to result
          addContiguousOffsets(toAddOffsets, element, add);
        }
        // In a lists, we process all list items 
        else if (element.tagName == 'UL')
          for (var el = element.firstChild; el; el = el.nextSibling)
            toProcess.push(el);
        // Ignore links
        else if (element.tagName == 'A') continue;
        else throw 'Unknown element';
      }

      // If we contained tagname tags, remove them.
      if (rem.length > 0)
        add = [];

      return { 
        enabled: true,
        error: undefined,
        data: {
          add: add,
          rem: rem
        }
      };
    }

    // Utility function used in analyze.
    var addContiguousOffsets = function (offsets, element, result){
      var start = undefined;
      for (var i = 0; i < offsets.length; i++) {
        if (start == undefined) {
          start = offsets[i];
        }
        if (i > 0 && offsets[i] != offsets[i-1] + 1) {
          result.push({
            el: element,
            start: start,
            end: (offsets[i-1] || start) + 1
          });
          start = offsets[i];
        }
        if (i == offsets.length -1) {
          result.push({
            el: element,
            start: start,
            end: offsets[i] + 1
          });
        }
      }
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

