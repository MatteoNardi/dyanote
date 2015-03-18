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
    element.on('$destroy', function () {
      this.openNotes.removeFocusHandler(focusHandler);
    });
  }

  render () {
    this.renderNotes();
    this.renderPath();
  }

  renderNotes() {
    var me = this, 
      open = this.openNotes.notes,
      children = open.map((n) => n.children),
      all = children.reduce((output, current) => {
        return (output || []).concat(...current);
      }, [open[0]]);

    // Join data
    var openSet = new Set(open);
    var selection = this.svg.select('.notes').selectAll('circle').data(all);

    // Enter
    selection.enter().append('circle')
      .attr('r', '4')
      .on('click', function (note) { me.onNoteClicked(this, note); })
      .append('title');

    // Update
    selection
      .attr('title', (note, i) => note.title)
      .select('title')
        .text((note, i) => note.title);
    this.updateOpenNotes(selection.filter(note => openSet.has(note)));
    this.updateChildNotes(selection.filter(note => !openSet.has(note)));    

    // Exit
    selection.exit().remove();
  }

  // Update notes in selection to match "Open" style
  updateOpenNotes (selection) {
    var me = this;
    selection
      .attr('class', 'open')
      .transition()
        .attr('cx', (note, i) => me.defaultPos(i).x)
        .attr('cy', (note, i) => me.defaultPos(i).y);
  }

  // Update notes in selection to match "Child" style
  updateChildNotes (selection) {
    var me = this;
    var getPos = (note) => {
      var parent = this.openNotes.notes.indexOf(note.parent);
      if (parent == -1) throw new Error (`Note ${note.title} has no parent open`);
      var { x, y } = me.defaultPos(parent);
      var radius = 20 + 5 * (note.id % 13)/13,
        baseAngle = note.id % 2 ? Math.PI/4 : Math.PI*5/4,
        angle = baseAngle + ((note.id % 12)/12 - .5) * Math.PI*2/3;
      return {
        x: x + radius * Math.cos(angle),
        y: y - radius * Math.sin(angle)
      }
    };

    selection
      .attr('class', 'child')
      .transition()
        .attr('cx', note => getPos(note).x)
        .attr('cy', note => getPos(note).y);
  }

  renderPath () {
    var me = this;

    var paths = this.svg.select('.mainPath').selectAll('.path')
      .data(this.openNotes.notes);

    paths.enter().append('path')
      .attr('class', 'path')
      .attr('d', (note, i) => {
        if (i == 0) return;
        var source = me.defaultPos(i-1),
          dest = me.defaultPos(i);
        return `M${source.x},${source.y} ` +        // Move to source
               `C${source.x+25},${source.y+25} ` +  // First control point 
                 `${dest.x-25},${dest.y-25} ` +     // Second control point
                 `${dest.x},${dest.y}`;             // Destination
      });
    
    paths.exit().remove();
  }

  // Default open note circles position
  defaultPos (i) {
    return {
      x: i * 45 + (i%2 ? -12 : +12),
      y: i * 45 + (i%2 ? +12 : -12)
    }
  }

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
      // .transition()
      //   .duration(200)
      //   .attr('r', '3')
      //   .attr('fill', '#07a3d4') // Dyanote blue
      // .transition()
      //   .duration(200)
      //   .attr('r', '4');

    // Translate view
    var i = this.openNotes.notes.indexOf(note) -1,
      pos = this.defaultPos(i > 0 ? i : 0);
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