
describe ('Scribe title command', function () {

  var scribe,
    editor,
    range;

  // Initialize the controller and a mock scope
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
    expect(scribe.commands['link']).toBeTruthy();
  });

  // document.execCommand doesn't seem to work on PhantomJS...
  // So there is no way to test this. 
  xit('should create links', function () {
    editor.html(
      '<em>' +
        'Text0' +
      '</em>'
    );
    var body = angular.element(document.body)
    body.append(editor);

    console.log(document.body);
    range.setStartBefore(editor.find('em')[0]);
    range.setEndAfter(editor.find('em')[0]);

    scribe.commands['link'].execute();
    expect(editor.html()).toEqual('<a href="???">Text0</a>');
  });
});
