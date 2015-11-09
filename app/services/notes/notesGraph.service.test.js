
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

  it('should allow to get all descendants', function () {
    notesGraph.setParent(2, 0);
    notesGraph.setParent(1, 2);
    notesGraph.setParent(3, 1);
    notesGraph.setParent(4, 0);
    notesGraph.setParent(5, 3);
    notesGraph.setParent(6, 5);
    expect(notesGraph.descendants(6)).toEqual([]);
    expect(notesGraph.descendants(5)).toEqual([6]);
    expect(notesGraph.descendants(2)).toContain(1);
    expect(notesGraph.descendants(2)).toContain(3);
    expect(notesGraph.descendants(2)).toContain(5);
    expect(notesGraph.descendants(2)).toContain(6);
  });

  it('should allow to get roots', function () {
    notesGraph.setParent(2, 1);
    notesGraph.setParent(5, 3);
    notesGraph.setParent(6, 5);
    notesGraph.setParent(10, 15);
    notesGraph.setParent(10, 17);
    notesGraph.setTrashed(17, true);
    expect(notesGraph.roots()).toEqual([1, 3, 15]);
  });

  it('should not consider an empty id as a parent', function () {
    notesGraph.setParent('2', '');
    expect(notesGraph.roots()).toEqual(['2']);
  });

  it('should allow to get all trashed notes', function () {
    notesGraph.setParent(2, 1);
    notesGraph.setParent(3, 1);
    notesGraph.setParent(4, 2);
    notesGraph.setTrashed(2, true);
    notesGraph.setTrashed(4, true);
    expect(notesGraph.allTrashed()).toEqual([2, 4]);
  });
});
