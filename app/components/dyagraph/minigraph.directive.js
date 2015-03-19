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
    main.append('g').attr('class', 'mainPath');
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
          .attr('cx', (note, i) => Minigraph.getPosOfOpenNote(i).x)
          .attr('cy', (note, i) => Minigraph.getPosOfOpenNote(i).y);
  }

  updateChildNotes (selection) {
    var me = this;
    selection
      .filter(note => !this.openNotes.isOpen(note))
        .attr('class', 'child')
        .transition()
          .each(function (note, i) {
            var parentIndex = me.openNotes.notes.indexOf(note.parent),
              pos = Minigraph.getPosOfChildNote(note, parentIndex);
            d3.select(this).attr({
              'cx': pos.x,
              'cy': pos.y
            });
          })
  }

  exitNotes (selection) {
    selection.exit()
      .transition()
        .remove();
  }

  renderPath () {
    var selection = this.svg.select('.mainPath')
      .selectAll('.path')
        .data(this.visibleNotes.slice(1));

    this.enterPaths(selection);
    this.updatePaths(selection);
    this.updateToOpenPaths(selection);
    this.updateToChildPaths(selection);
    this.updateEndingPaths(selection);
    this.exitPaths(selection);
  }

  enterPaths (selection) {
    selection.enter().append('path');
  }

  updatePaths (selection) {}

  updateToOpenPaths (selection) {
    selection
      // We don't count the root, so the current open note is the (i+1)-th
      .filter((note, i) => (this.openNotes.isOpen(note)))
        .each(function (note,i) { console.info(i, note.title)})
        .attr('class', 'path toOpen')
        .attr('d', (note, i) => {
          var source = Minigraph.getPosOfOpenNote(i),
            dest = Minigraph.getPosOfOpenNote(i+1);
          return `M${source.x},${source.y} ` +        // Move to source
                 `C${source.x+25},${source.y+25} ` +  // First control point 
                   `${dest.x-25},${dest.y-25} ` +     // Second control point
                   `${dest.x},${dest.y}`;             // Destination
        });
  }

  updateToChildPaths (selection) {
    selection
      // We don't count the root, so the current open note is the (i+1)-th
      .filter((note, i) => (!this.openNotes.isOpen(note)))
        .attr('class', 'path toChild')
        .attr('d', (note, i) => {
          var parentIndex = this.openNotes.notes.indexOf(note.parent),
            source = Minigraph.getPosOfOpenNote(parentIndex),
            dest = Minigraph.getPosOfChildNote(note, parentIndex);
          return `M${source.x},${source.y} ` +        // Move to source
                 `C${source.x+25},${source.y+25} ` +  // First control point 
                   `${dest.x-25},${dest.y-25} ` +     // Second control point
                   `${dest.x},${dest.y}`;             // Destination

        });
  } 

  updateEndingPaths (selection) {

  } 

  exitPaths (selection) {
    selection.exit()
      .transition()
        .remove();
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
      x: n * 45 + (n%2 ? -12 : +12),
      y: n * 45 + (n%2 ? +12 : -12)
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