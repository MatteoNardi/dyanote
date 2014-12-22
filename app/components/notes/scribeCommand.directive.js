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
});