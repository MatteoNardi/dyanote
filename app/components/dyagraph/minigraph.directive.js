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
    var main = this.svg.append('g').attr('class', 'main')
    main.append('path').attr('class', 'mainPath');
    main.append('g').attr('class', 'notes');

    // Render on openNotes changes
    scope.$watchCollection(() => this.openNotes.notes, () => this.render());

    // Animate note focusing
    var focusHandler = this.onNoteFocused.bind(this);
    this.openNotes.addFocusHandler(focusHandler);
    element.on('$destroy', () => {
      this.openNotes.removeFocusHandler(focusHandler);
    });
  }

  // Render functions

  render () {
    this.visibleNotes = this.getVisibleNotes();

    this.renderNotes();
    this.renderPath();
  }

  renderNotes() {
    var selection = this.svg.select('.notes')
      .selectAll('circle')
        .data(this.visibleNotes);

    this.enterNotes(selection);
    this.updateNotes(selection);
    this.updateOpenNotes(selection);
    this.updateChildNotes(selection);    
    this.exitNotes(selection);
  }

  enterNotes (selection) {
    var me = this;
    selection.enter().append('circle')
      .attr('r', '4')
      .on('click', function (note) { me.onNoteClicked(this, note); })
      .append('title');    
  }

  updateNotes (selection) {
    selection
      .attr('title', (note, i) => note.title)
      .select('title')
        .text((note, i) => note.title);    
  }

  updateOpenNotes (selection) {
    selection
      .filter(note => this.openNotes.isOpen(note))
        .attr('class', 'open')
        .transition()
          // .duration(500)
          .attr('cx', (note, i) => Minigraph.getPosOfOpenNote(i).x)
          .attr('cy', (note, i) => Minigraph.getPosOfOpenNote(i).y);
  }

  updateChildNotes (selection) {
    var me = this;
    selection
      .filter(note => !this.openNotes.isOpen(note))
        .attr('class', 'child')
        .transition()
          // .duration(500)
          .attr('cx', (note, i) => Minigraph.getPosOfChildNote(note, me.openNotes.notes.indexOf(note.parent)).x)
          .attr('cy', (note, i) => Minigraph.getPosOfChildNote(note, me.openNotes.notes.indexOf(note.parent)).y)
  }

  exitNotes (selection) {
    selection.exit()
      .transition()
        .remove();
  }

  renderPath () {
    var path = this.svg.select('.mainPath');
    
    var start = Minigraph.getPosOfOpenNote(0);
    var data = `M${start.x},${start.y} `;
    var len = Math.max(this.openNotes.notes.length, 20);
    var pos = start;
    for (var i = 1; i < len; i++) {
      if (i < this.openNotes.notes.length) {
        pos = Minigraph.getPosOfOpenNote(i);
        if (i != this.openNotes.notes.length-1)
          data += `S${pos.x-20},${pos.y-20} `;
        else
          data += `S${pos.x},${pos.y} `;
        data +=  `${pos.x},${pos.y}`;
      } else {
        data += `S${pos.x},${pos.y} ${pos.x},${pos.y}`;
      }
    }

    path
      .transition()
        .duration(500)
        .attr('d', data)
  }

  //
  // Utility methods
  //

  // Get all notes visible on the minigraph (open notes and their children)
  getVisibleNotes () {
    var children = this.openNotes.notes.map((n) => n.children);
    return children.reduce((output, current) => {
      return (output || []).concat(...current);
    }, [this.openNotes.notes[0]]);
  }

  // Get position of the n-th open note 
  static getPosOfOpenNote (n) {
    return {
      x: n * 45 + (n%2 ? +9 : -9),
      y: n * 45 + (n%2 ? -9 : +9)
    }
  }

  // Get position of note, child of the n-th open note 
  static getPosOfChildNote (note, n) {
    var { x, y } = Minigraph.getPosOfOpenNote(n);
    var radius = 20 + 5 * (note.id % 13)/13,
      baseAngle = note.id % 2 ? Math.PI/4 : Math.PI*5/4,
      angle = baseAngle + ((note.id % 12)/12 - .5) * Math.PI*2/3;
    return {
      x: x + radius * Math.cos(angle),
      y: y - radius * Math.sin(angle)
    }
  }

  //
  // Event Handlers
  //

  // Open note circles click handler
  onNoteClicked (el, note) {
    if (this.openNotes.notes.indexOf(note) == -1)
      this.openNotes.open(note);
    else
      this.openNotes.focus(note);
    this.scope.$digest();
  }

  // openNotes focus event handler
  onNoteFocused (note) {
    // Highlight element
    this.svg.selectAll('.open')
      .attr('class', 'open')
      .filter(data => data === note)
        .attr('class', 'open focused')

    // Translate view
    // The topLeftNote-th note will be put in the top left corner
    var topLeftNote = 0,
      index = this.openNotes.notes.indexOf(note);
    if (index > 0)
      topLeftNote = index -1;
    if (this.openNotes.notes.length-1 == index && topLeftNote > 0)
      topLeftNote--;
    var pos = Minigraph.getPosOfOpenNote(topLeftNote);
    console.warn(topLeftNote, index, this.openNotes.notes.length);
    this.svg.select('.main')
      .transition()
        .duration(500)
        .attr('transform', `translate(${35-pos.x}, ${35-pos.y})`);
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