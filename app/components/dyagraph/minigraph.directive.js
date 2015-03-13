'use strict';

class Minigraph {
  constructor (notesGraph, openNotes) {
    this.openNotes = openNotes;
    this.notesGraph = notesGraph;
    console.log('constructor')
  }

  link (scope, element) {
    console.log('link')
    this.scope = scope;
    this.element = element;

    this.svg = d3.select(element[0]).append("svg").append('g');
    scope.$watchCollection(() => this.openNotes.notes, () => this.render());
    // scope.$watch(() => {return this.openNotes.notes.length}, () => this.render());
  }

  render () {
    console.info('render');
    var width = 300,
      height = 300,
      margin = 10;

    var mainCircles = this.svg.selectAll('circle.open')
      .data(this.openNotes.notes);

    mainCircles.enter().append('circle')
      .attr('class', 'open')
      .attr('r', '4')
      .attr('cy', '30');

    mainCircles
      .attr('cx', (note, i) => margin + i * 30 );

    mainCircles.exit().remove();
  }

  onNodeClicked () {
    // Todo
  }
}

angular.module('dyanote').directive('minigraph', function (notesGraph, openNotes) {
  return {
    restrict: 'A',
    link: function (scope, element) {
      var minigraph = new Minigraph(notesGraph, openNotes);
      minigraph.link(scope, element);
    }
  };
});