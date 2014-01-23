'use strict';

describe('Directive: richTextEditor', function () {

  // load the directive's module
  beforeEach(module('dyanote'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('do something', inject(function ($compile) {
    element = angular.element('<html><rich-text-editor></rich-text-editor></html>');
    element = $compile(element)(scope);
    expect(element).toBeDefined();
  }));
});
