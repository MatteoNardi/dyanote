
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

  it('should add formatting on simple selection', function () {
    editor.html(
      'This html has <strong>some</strong> formatting'
    );
    range.setStart(editor.contents()[0], 5);
    range.setEnd(editor.contents()[1], 1);

    scribe.commands['em'].execute();
    expect(editor.html()).toEqual('This <em>html has <strong>some</strong></em> formatting');
  });
});
