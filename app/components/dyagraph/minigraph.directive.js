'use strict';

class Minigraph {
  constructor (notesGraph, openNotes) {
    this.openNotes = openNotes;
    this.notesGraph = notesGraph;
  }

  link (scope, element) {
    this.scope = scope;
    this.element = element;

    this.svg = d3.select(element[0]).append('svg');
    this.svg.append('g');

    // Render on openNotes changes
    scope.$watchCollection(() => this.openNotes.notes, () => this.render());

    // Animate note focusing
    var focusHandler = this.onNoteFocused.bind(this);
    this.openNotes.addFocusHandler(focusHandler);
    element.on('$destroy', function () {
      this.openNotes.removeFocusHandler(focusHandler);
    });
  }

  render () {
    this.renderOpenNotes();
    this.renderPath();
  }

  renderOpenNotes () {
    var me = this;

    var notes = this.svg.select('g').selectAll('.open')
      .data(this.openNotes.notes);

    notes.enter().append('circle')
      .attr('class', 'open')
      .attr('r', '4')
      .attr('cy', (note, i) => me.defaultPos(i).x)
      .attr('cx', (note, i) => me.defaultPos(i).y)
      .attr('fill',  this.defaultFill)
      .on('click', function (note) { me.onNoteClicked(this, note); })
      .append('title');

    notes
      .attr('title', (note, i) => note.title )
      .select('title')
        .text((note, i) => note.title);

    notes.exit().remove();
  }

  renderPath () {

  }

  // Default note fill for open note circles
  defaultFill (note, i) {
    if (i == 0)
      return '#002f2f'; // Dyanote green
    else
      return '#82b8b3';
  }

  // Default open note circles position
  defaultPos (i) {
    return {
      x: i * 45 + (i%2 ? -5 : +5),
      y: i * 45 + (i%2 ? +5 : -5)
    }
  }

  // Open note circles click handler
  onNoteClicked (el, note) {
    this.openNotes.focus(note);
    this.scope.$digest();
  }

  // openNotes focus event handler
  onNoteFocused (note) {
    // Highlight element
    this.svg.selectAll('.open')
      .attr('fill', this.defaultFill)
      .filter(data => data === note)
      .transition()
        .duration(200)
        .attr('r', '3')
        .attr('fill', '#07a3d4') // Dyanote blue
      .transition()
        .duration(200)
        .attr('r', '4');

    // Translate view
    var i = this.openNotes.notes.indexOf(note) -2,
      pos = this.defaultPos(i > 0 ? i : 0);
    this.svg.select('g')
      .transition()
        .duration(500)
        .attr('transform', `translate(${35-pos.y}, ${35-pos.x})`);
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