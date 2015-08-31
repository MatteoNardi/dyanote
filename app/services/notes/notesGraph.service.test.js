
describe('Service: notesGraph', function () {
  beforeEach(module('dyanote'));

  var notesGraph;
  beforeEach(inject(function (_notesGraph_) {
    notesGraph = _notesGraph_;
  }));

  it('should work', function () {
    notesGraph.setTitle(0, 'Root note');
    notesGraph.setTitle(1, 'First note');
    notesGraph.setTitle(2, 'Second note');
    notesGraph.setBody(2, 'Second note body');
    notesGraph.setParent(1, 0);
    notesGraph.setParent(2, 1);
    notesGraph.setParent(2, 0);

    expect(notesGraph.title(0)).toBe('Root note');
    expect(notesGraph.title(1)).toBe('First note');
    expect(notesGraph.title(2)).toBe('Second note');
    expect(notesGraph.body(2)).toBe('Second note body');
    expect(notesGraph.parent(0)).toBe(undefined);
    expect(notesGraph.parent(1)).toBe(0);
    expect(notesGraph.parent(2)).toBe(0);
    expect(notesGraph.children(0)).toEqual([1, 2]);
    expect(notesGraph.allNotes()).toContain(0);
    expect(notesGraph.allNotes()).toContain(1);
    expect(notesGraph.allNotes()).toContain(2);
  });
});
