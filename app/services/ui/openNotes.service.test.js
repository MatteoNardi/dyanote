
describe('openNotes service', function () {
  beforeEach(module('dyanote'));

  var openNotes;
  beforeEach(inject(function (_openNotes_, _notesGraph_) {
    openNotes = _openNotes_;
    // Note dummies

    _notesGraph_.parent = note => {
      if (note == 'A') return undefined;
      if (note == 'B') return 'A';
      if (note == 'C') return 'B';
      if (note == 'D') return undefined;
    };
  }));

  it('should start empty', function () {
    expect(openNotes.notes.length).toBe(0);
  });

  it('should add notes till root', function () {
    openNotes.open('C');
    expect(openNotes.notes.length).toBe(3);
    expect(openNotes.notes[0]).toBe('A');
    expect(openNotes.notes[1]).toBe('B');
    expect(openNotes.notes[2]).toBe('C');
  });

  it('should replace notes', function () {
    openNotes.open('C');
    openNotes.open('D');
    openNotes.open('B');
    expect(openNotes.notes.length).toBe(2);
    expect(openNotes.notes[0]).toBe('A');
    expect(openNotes.notes[1]).toBe('B');
  });

  it('should close notes', function () {
    openNotes.open('C');
    openNotes.close('B');
    expect(openNotes.notes.length).toBe(1);
    expect(openNotes.notes[0]).toBe('A');
  });

  it('should allow to insert notes after others', function () {
    openNotes.open('C');
    openNotes.openAfter('D', 'B');
    expect(openNotes.notes.length).toBe(3);
    expect(openNotes.notes[0]).toBe('A');
    expect(openNotes.notes[1]).toBe('B');
    expect(openNotes.notes[2]).toBe('D');
  });

  it('should allow to focus notes and notify subscribers', function () {
    var cb1, cb2;
    openNotes.addFocusHandler((note) => cb1 = note);
    openNotes.addFocusHandler((note) => cb2 = note);
    openNotes.open('C');
    openNotes.focus('B');
    expect(cb1).toBe('B');
    expect(cb2).toBe('B');
  });

  it('should allow to remove focusHandlers', function () {
    var cb1, cb2;
    var cb1_fn = (note) => cb1 = note;
    var cb2_fn = (note) => cb2 = note;
    openNotes.addFocusHandler(cb1_fn);
    openNotes.addFocusHandler(cb2_fn);
    openNotes.open('C');
    openNotes.removeFocusHandler(cb2_fn);
    openNotes.focus('B');
    expect(cb1).toBe('B');
    expect(cb2).toBe(undefined);
  });

  it('should have an isOpen method', function () {
    openNotes.open('B');
    expect(openNotes.isOpen('A')).toBe(true);
    expect(openNotes.isOpen('B')).toBe(true);
    expect(openNotes.isOpen('C')).toBe(false);
  });

  it('should update isOpen even after openNoteAfter', function () {
    openNotes.open('C');
    openNotes.openAfter('D', 'A');
    expect(openNotes.isOpen('A')).toBe(true);
    expect(openNotes.isOpen('B')).toBe(false);
    expect(openNotes.isOpen('C')).toBe(false);
    expect(openNotes.isOpen('D')).toBe(true);
  });

  it('should not open al already opened note', function () {
    openNotes.open('A');
    openNotes.open('B');
    openNotes.open('C');
    openNotes.open('A');
    openNotes.openAfter('B', 'A');
    expect(openNotes.notes.length).toBe(3);
    expect(openNotes.notes[0]).toBe('A');
    expect(openNotes.notes[1]).toBe('B');
    expect(openNotes.notes[2]).toBe('C');
  });
});
