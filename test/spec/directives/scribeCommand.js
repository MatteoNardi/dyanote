'use strict';

describe('Controller: dyanoteScribePlugin', function () {

  // load the controller's module
  beforeEach(module('dyanote'));

  var scribe,
    editor,
    range;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (dyanoteScribePlugin) {

    editor = angular.element('<div contenteditable></div>');
    range = document.createRange();
    spyOn(window, 'getSelection').andReturn({
      getRangeAt: function () {
        return range;
      }
    })

    scribe = {
      commands: {},
      el: editor[0]
    };
    dyanoteScribePlugin(scribe);
  }));

  describe('Title command', function () {
    it('should exist', function () {
      expect(scribe.commands['title']).toBeTruthy();
    });

    it('should work on whole editor valid selection', function () {
      editor.html('<strong>Hello world</strong>');
      range.setStartBefore(editor.find('strong')[0]);
      range.setEndAfter(editor.find('strong')[0]);

      expect(scribe.commands['title'].queryEnabled()).toBe(true);
    });

    it('should be disabled if range falls out of editor', function () {
      editor.html('<strong>Hello world</strong>');
      var detachedNode = angular.element('<div><p><b>Prova</b></p><br/></div>');
      var container = angular.element('<div></div>')[0];
      container.appendChild(detachedNode[0]);
      container.appendChild(editor[0]);

      range.setStartBefore(detachedNode.find('b')[0]);
      range.setEndAfter(editor.find('strong')[0]);
      expect(scribe.commands['title'].queryEnabledWithReason()).toEqual([false, 'Extreme A is out of Scribe editor']);

      container.removeChild(detachedNode[0]);
      container.appendChild(detachedNode[0]);
      range.setStartAfter(editor.find('strong')[0]);
      range.setEndBefore(detachedNode.find('b')[0]);
      expect(scribe.commands['title'].queryEnabledWithReason()).toEqual([false, 'Extreme B is out of Scribe editor']);
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

      expect(scribe.commands['title'].queryEnabledWithReason()).toEqual([false, 'Invalid tag inside selection: BR']);
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

      expect(scribe.commands['title'].queryEnabledWithReason()).toEqual([false, 'Invalid tag inside selection: B']);
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

      expect(scribe.commands['title'].queryEnabledWithReason()).toEqual([false, 'Invalid tag inside selection: BR']);
    });

    it('should work on deep tag hierarchies', function () {
      editor.html('<strong><em><strong><em>Hello world</em></strong></em></strong>');
      range.setStartBefore(editor.find('em')[1]);
      range.setEndAfter(editor.find('em')[1]);


      expect(scribe.commands['title'].queryEnabledWithReason()).toEqual([true, undefined]);
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

      expect(scribe.commands['title'].queryEnabledWithReason()).toEqual([false, 'Invalid tag inside line: A']);
    });
  });
});
