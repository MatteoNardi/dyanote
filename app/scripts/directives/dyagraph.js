'use strict';

angular.module('dyanote')

// The interactive graph displaying all notes.
.directive('dyagraph', function ($window, $timeout, $location, notesGraph, openNotes) {
  return {
    restrict: 'EA',
    link: function (scope, element, attrs) {
      var svg = d3.select(element[0]).append("svg").append('g');

      // Browser onresize event
      $window.addEventListener('resize', function (){
        if (!scope.dirty) {
          scope.dirty = true;
          $timeout(function () {
            scope.render();
            scope.dirty = false;
          }, 500, false)
        }
      });

      var clickhandler = function (data) {
        scope.$apply(function () {
          var note = data.obj;
          openNotes.open(data.note);
          $location.path('/notes');
        });
      };

      scope.render = function () {
        var getHierarchy = function (note) {
          var obj = {
            name: note.title,
            note: note,
            children: []
          };
          note.children.forEach(function (child) {
            obj.children.push(getHierarchy(child));
          });
          return obj;
        }
        var rootNote = getHierarchy(notesGraph.getRoot());

        var width = element[0].parentNode.offsetWidth,
            height = element[0].parentNode.offsetHeight,
            marginX = width * 0.1,
            marginY = height * 0.1;

        svg.attr('transform', 'translate('+ marginX +','+ marginY +')')

        var cluster = d3.layout.cluster()
            .size([height - 2*marginY, width - 2*marginX]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var nodes = cluster.nodes(rootNote),
            links = cluster.links(nodes);

        // DATA JOIN
        var link = svg.selectAll('.link').data(links);
        var node = svg.selectAll('.node').data(nodes)
        // ENTER
        link.enter().append('path').attr('class', 'link');
        var newnode = node.enter().append('g').attr('class', 'node');
        newnode.append('circle').attr('r', 4.5);
        newnode.append('text');
        newnode.on('click', clickhandler);
        // UPDATE
        link.transition().attr('d', diagonal);
        node.transition().attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; })
          .select('text')
            .attr('dy', -8)
            .text(function(d) { return d.name; });
        // EXIT
        link.exit().remove();
        node.exit().remove();
      };

      scope.render();
    }
  };
});