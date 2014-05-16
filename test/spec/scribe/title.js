
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
    expect(scribe.commands['title']).toBeTruthy();
  });

  it('should work on whole editor valid selection', function () {
    editor.html('<strong>Hello world</strong>');
    range.setStartBefore(editor.find('strong')[0]);
    range.setEndAfter(editor.find('strong')[0]);

    expect(scribe.commands['title'].analyze().error).toEqual(undefined);
  });

  it('should be disabled if range falls out of editor', function () {
    editor.html('<strong>Hello world</strong>');
    var detachedNode = angular.element('<div><p><b>Prova</b></p><br/></div>');
    var container = angular.element('<div></div>')[0];
    container.appendChild(detachedNode[0]);
    container.appendChild(editor[0]);

    range.setStartBefore(detachedNode.find('b')[0]);
    range.setEndAfter(editor.find('strong')[0]);
    expect(scribe.commands['title'].analyze().error).toEqual('Extreme A is out of Scribe editor');

    container.removeChild(detachedNode[0]);
    container.appendChild(detachedNode[0]);
    range.setStartAfter(editor.find('strong')[0]);
    range.setEndBefore(detachedNode.find('b')[0]);
    expect(scribe.commands['title'].analyze().error).toEqual('Extreme B is out of Scribe editor');
  });

  it('should be disabled if range contains invalid element (not in extremes subtrees)', function () {
    editor.html(
      '<strong>Hello world</strong>' +
      '<em>Ita <br/>  lic</em>' +
      '<em>Italic</em>' +
      '<i>Invalid Tag</i>'
    );
    range.setStartBefore(editor.find('strong')[0]);
    range.setEndBefore(editor.find('i')[0]);

    expect(scribe.commands['title'].analyze().error).toEqual('Invalid tag inside selection: BR');
  });

  it('should be disabled if range extreme contains invalid element (in extremes subtrees)', function () {
    editor.html(
      '<strong>Hello world</strong>' +
      '<em>Italic</em>' +
      '<em>Ital <b></b>  ic</em>' +
      '<i>Invalid Tag</i>'
    );
    range.setStartBefore(editor.find('strong')[0]);
    range.setEndBefore(editor.find('i')[0]);

    expect(scribe.commands['title'].analyze().error).toEqual('Invalid tag inside selection: B');
  });

  it('should be disabled if range extreme contains invalid element (in extremes subtrees)', function () {
    editor.html(
      '<em>' +
      '  <em>' +
      '   <strong>Text1</strong>' +
      '   <br/>' +
      '  </em>' +
      '  <em> Text2 </em>' +
      '  <strong> Text3 </strong>' +
      '  Text4' +
      '</em>'
    );
    range.setStartBefore(editor.find('strong')[0]);
    range.setEndBefore(editor.find('strong')[1]);

    expect(scribe.commands['title'].analyze().error).toEqual('Invalid tag inside selection: BR');
  });

  it('should work on deep tag hierarchies', function () {
    editor.html('<strong><em><strong><em>Hello world</em></strong></em></strong>');
    range.setStartBefore(editor.find('em')[1]);
    range.setEndAfter(editor.find('em')[1]);


    expect(scribe.commands['title'].analyze().error).toEqual(undefined);
  });

  it('should be disabled if line contains invalid tags (Outside selection)', function () {
    editor.html(
      '<em>' +
      '  <em>' +
      '   <br/>' + // Line break
      '   <strong>Text1</strong>' +
      '   <a href="http://dyanote.com/">Link</a>' + // Invalid tag
      '  </em>' +
      '  <em> Text2 </em>' + // Selection start
      '  <strong> Text3 </strong>' + // Selection end
      '  Text4' +
      '</em>'
    );
    range.setStartBefore(editor.find('em')[2]);
    range.setEndAfter(editor.find('strong')[1]);

    expect(scribe.commands['title'].analyze().error).toEqual('Invalid tag inside line: A');
  });

  it('should execute well', function () {
    editor.html(
      '<em>' +
        '<em>' +
          'Text0 ' +
          '<br/>' + // Line break
          '<strong>Text1 </strong>' +
        '</em>' +
        '<em>Text2 </em>' + // Selection start
        '<strong>Text3 </strong>' + // Selection end
        'Text4' +
      '</em>'
    );
    range.setStartBefore(editor.find('em')[2]);
    range.setEndAfter(editor.find('strong')[1]);

    scribe.commands['title'].execute();
    expect(editor.html()).toEqual('<em>Text0 <br><strong></strong></em><em></em><strong></strong><h1>Text1 Text2 Text3 Text4</h1>');
  });

  it('should remove h1 on re-execution', function () {
    editor.html(
      '<h1>' +
        'Text0' +
      '</h1>'
    );
    range.setStartBefore(editor.find('h1')[0]);
    range.setEndAfter(editor.find('h1')[0]);

    scribe.commands['title'].execute();
    expect(editor.html()).toEqual('Text0');
  });
});
