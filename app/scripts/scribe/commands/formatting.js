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
      var range = window.getSelection().getRangeAt(0);
      var A = range.startContainer;
      var B = range.endContainer;
      var startOffset = range.startOffset;
      var endOffset = range.endOffset;
      var ancestor = range.commonAncestorContainer;
      var add = [];
      var rem = [];


      if (B.nodeType == utils.TEXT_NODE) {
        var splitted = B.splitText(endOffset);
        B = B.parentNode;
        endOffset = utils.getOffset(splitted);
      }
      if (A.nodeType == utils.TEXT_NODE) {
        var splitted = A.splitText(startOffset);
        A = A.parentNode;
        startOffset = utils.getOffset(splitted);
        if (A == B) endOffset++;
      }

      // Case 2: common ancestor is Scribe element
      if (ancestor == scribe.el || (A == scribe.el && B == scribe.el)) {
        var it = A;
        var offsetA = startOffset;
        while (it != scribe.el) {
          offsetA = utils.getOffset(it);
          it = it.parentNode;
        };
        it = B;
        var offsetB = endOffset;
        while (it != scribe.el) {
          offsetB = utils.getOffset(it) + 1;
          it = it.parentNode;
        };

        for (var i = startOffset; i < endOffset; i++) {
          // Todo: check node for ul etc.
        }
        add.push({
          el: scribe.el,
          start: offsetA,
          end: offsetB
        });
      }

      return { 
        enabled: true,
        error: undefined,
        data: {
          add: add,
          rem: rem
        }
      };

      /*
      function process (parent, child, next) {
        console.log(parent.nodeType)
        if (parent == ancestor) return child;
        if (parent.nodeType == utils.TEXT_NODE) {
          console.log("fu")
        }
      }
      process(A, A.childNodes[range.startOffset], 'nextSibling');
      process(B, B.childNodes[range.endOffset], 'previousSibling');
      */
    }
  };
}

dyanote.scribe.commands.strong = formatting('strong');
dyanote.scribe.commands.em = formatting('em');

