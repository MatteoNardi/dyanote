'use strict';

xdescribe('Service: notesCoherenceTools', function () {

  // load the service's module
  beforeEach(module('dyanote'));

  // instantiate service
  var notesCoherenceTools;
  beforeEach(inject(function (_notesCoherenceTools_) {
    notesCoherenceTools = _notesCoherenceTools_;
  }));

  it('should replace links using convertLink', function () {
    var fakeUrl = 'http://api.dyanote.com/123901283';
    var realUrl = 'http://api.dyanote.com/42';
    var note = {
      body: '<a href="' + fakeUrl + '">Abracadabra</a>'
    }
    notesCoherenceTools.convertLink(note, fakeUrl, realUrl);
    expect(note.body).toEqual('<a href="' + realUrl + '">Abracadabra</a>')
  });

  it('should remove dead links using removeLink', function () {
    var oldUrl = 'http://api.dyanote.com/42';
    var note = {
      body: '<a href="' + oldUrl + '">Abracadabra</a>'
    }
    notesCoherenceTools.removeLink(note, oldUrl);
    expect(note.body).toEqual('Abracadabra')
  });

  it('should rename links', function () {
    var note42 = {
      title: 'New title',
      url: 'http://api.dyanote.com/42'
    };
    var note = {
      body: '<a href="http://api.dyanote.com/42">Abracadabra</a>'
    }
    notesCoherenceTools.renameLink(note, note42, 'Abracadabra');
    expect(note.body).toEqual('<a href="http://api.dyanote.com/42">New title</a>')
  });
});
