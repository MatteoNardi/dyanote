
describe ('Scribe title command', function () {

  var scribe,
    editor,
    range;


  beforeEach(inject(function () {
    editor = angular.element('<div contenteditable></div>');
    range = document.createRange();
    spyOn(window, 'getSelection').andReturn({
      getRangeAt: function () {
        return range;
      }
    })

    scribe = {
      commands: {},
      el: editor[0],
      use: function (plugin) {
        plugin(scribe);
      },
      transactionManager: {
        run: function (fn) {
          fn ();
        }
      }
    };
    scribe.use(dyanote.scribe.plugin);
  }));

  it('should exist', function () {
    expect(scribe.commands['em']).toBeTruthy();
  });

  it('should add formatting on simple selection', function () {
    editor.html(
      'This html has no formatting'
    );
    range.setStart(editor.contents()[0], 5);
    range.setEnd(editor.contents()[0], 16);

    scribe.commands['em'].execute();
    expect(editor.html()).toEqual('This <em>html has no</em> formatting');
  });

  it('should add formatting on selection containing other formatting', function () {
    editor.html(
      'This html has <strong>some</strong> formatting'
    );
    range.setStart(editor.contents()[0], 5);
    range.setEnd(editor.contents()[2], 0);

    scribe.commands['em'].execute();
    expect(editor.html()).toEqual('This <em>html has <strong>some</strong></em> formatting');
  });

  it('should add formatting inside other formatting', function () {
    editor.html(
      'This <strong>html has some</strong> formatting'
    );
    range.setStart(editor.find('strong').contents()[0], 5);
    range.setEnd(editor.find('strong').contents()[0], 8);

    scribe.commands['em'].execute();
    expect(editor.html()).toEqual('This <strong>html <em>has</em> some</strong> formatting');
  });

  it('should allow formatting intersections', function () {
    editor.html(
      'This <strong>html has some</strong> formatting'
    );
    range.setStart(editor.find('strong').contents()[0], 5);
    range.setEnd(editor.contents()[2], 11);

    scribe.commands['em'].execute();
    expect(editor.html()).toEqual('This <strong>html <em>has some</em></strong><em> formatting</em>');
  });

  it('should remove formatting if executed again', function () {
    editor.html(
      'This <em>html has some</em> formatting'
    );
    range.setStart(editor.contents()[0], 2);
    range.setEnd(editor.contents()[2], 5);

    scribe.commands['em'].execute();
    expect(editor.html()).toEqual('This html has some formatting');
  });

  it('should ignore h1', function () {
    editor.html(
      'This <h1>html contains a title</h1> inside'
    );
    range.setStart(editor.contents()[0], 2);
    range.setEnd(editor.contents()[2], 5);

    scribe.commands['em'].execute();
    expect(editor.html()).toEqual('Th<em>is </em><h1>html contains a title</h1><em> insi</em>de');
  });

  it('should work well with lists', function () {
    editor.html(
      'Buy:'                +
        '<ul>'              +
          '<li>Milk</li>'   +
          '<li>Coffee</li>' +
          '<li>Apples</li>' +
        '</ul>'             +
      '..as soon as possible!'
    );
    range.setStart(editor.contents()[0], 2);
    range.setEnd(editor.contents()[2], 4);

    scribe.commands['strong'].execute();
    expect(editor.html()).toEqual(
      'Bu<strong>y:</strong>'                +
        '<ul>'                               +
          '<li><strong>Milk</strong></li>'   +
          '<li><strong>Coffee</strong></li>' +
          '<li><strong>Apples</strong></li>' +
        '</ul>'                              +
      '<strong>..as</strong> soon as possible!'
    );
  });
});
