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

    this.svg = d3.select(element[0]).append('svg');
    this.setupFilters();

    // Render on openNotes changes
    scope.$watchCollection(() => this.openNotes.notes, () => this.render());

    // Animate note focusing
    var focusHandler = this.onNoteFocused.bind(this);
    this.openNotes.addFocusHandler(focusHandler);
    element.on('$destroy', function () {
      this.openNotes.removeFocusHandler(focusHandler);
    });
  }

  setupFilters () {
    var defs = this.svg.append('defs');

    var filter = defs.append('focusFilter')
      .attr('id', 'drop-shadow')
      .attr('height', '130%');

    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 5)
      .attr('result', 'blur');

    // filter.append('feOffset')
    //   .attr('in', 'blur')
    //   .attr('dx', 5)
    //   .attr('dy', 5)
    //   .attr('result', 'offsetBlur');

    var feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'blur')
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
  }

  render () {
    console.info('render');
    var me = this,
      width = 300,
      height = 300,
      margin = 10;

    var mainCircles = this.svg.selectAll('.open')
      .data(this.openNotes.notes);

    mainCircles.enter().append('circle')
      .attr('class', 'open')
      .attr('r', '4')
      .attr('cy', '30')
      .on('click', function (note) { me.onNoteClicked(this, note); })
      .append('title');

    mainCircles
      .attr('cx', (note, i) => margin + i * 30 )
      .attr('title', (note, i) => note.title )
      .select('title')
        .text((note, i) => note.title);

    mainCircles.exit().remove();
  }

  onNoteClicked (el, note) {
    this.openNotes.focus(note);
    this.scope.$digest();
  }

  onNoteFocused (note) {
    console.log('onNoteFocused', note);
    this.svg.selectAll('.open')
      .filter(data => data === note)
      .transition()
        .duration(200)
        .attr('r', '5')
      .transition()
        .duration(200)
        .attr('r', '4')
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