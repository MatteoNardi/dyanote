
describe('openNotes service', function () {
  beforeEach(module('dyanote'));

  var openNotes, A, B, C;
  beforeEach(inject(function (_openNotes_) {
    openNotes = _openNotes_;
    // Note dummies
    A = {
      hasParent: function () { return false; }
    };
    B = {
      hasParent: function () { return true; },
      parent: A
    };
    C = {
      hasParent: function () { return true; },
      parent: B
    };
  }));

  it('should start empty', function () {
    expect(openNotes.notes.length).toBe(0);
  });

  it('should add notes till root', function () {
    openNotes.open(C);
    expect(openNotes.notes.length).toBe(3);
    expect(openNotes.notes[0]).toBe(A);
    expect(openNotes.notes[1]).toBe(B);
    expect(openNotes.notes[2]).toBe(C);
  });

  it('should replace notes', function () {
    openNotes.open(C);
    openNotes.open(B);
    expect(openNotes.notes.length).toBe(2);
    expect(openNotes.notes[0]).toBe(A);
    expect(openNotes.notes[1]).toBe(B);
  });

  it('should close notes', function () {
    openNotes.open(C);
    openNotes.close(B);
    expect(openNotes.notes.length).toBe(1);
    expect(openNotes.notes[0]).toBe(A);
  });

  it('should allow to insert notes after others', function () {
    openNotes.open(C);
    var D = {
      hasParent: function () { return false; }
    }
    openNotes.openAfter(D, B);
    expect(openNotes.notes.length).toBe(3);
    expect(openNotes.notes[0]).toBe(A);
    expect(openNotes.notes[1]).toBe(B);
    expect(openNotes.notes[2]).toBe(D);
  });
});
