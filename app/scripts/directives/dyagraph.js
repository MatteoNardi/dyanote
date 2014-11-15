'use strict';

angular.module('dyanote')

// The interactive graph displaying all notes.
.directive('dyagraph', function (notesGraph) {
  return {
    restrict: 'E',
    link: function (scope, element, attrs) {
      var notes = notesGraph.getNotes();

      d3.select(element[0])
        .select('div')
        .data(notes)
        .enter().append('div')
        .text(function (d) { return 'Note ' + d.title; });

      
      console.log('dyagraph directive');
    }
  };
});