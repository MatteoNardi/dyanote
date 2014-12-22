'use strict';

angular.module('dyanote')

.directive('shortcut', function () {

  // Make sure we don't stop working when inside a text field.
  Mousetrap.stopCallback = function () {
    return false;
  }

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      // Bind shortcut to click event.
      Mousetrap.bind(attrs.shortcut, function (e) {
        e.preventDefault();
        element.trigger('click');
      });

      // Avoid memory leaks.
      element.on('$destroy', function () {
        Mousetrap.unbind(attrs.shortcut);
      })
    }
  };
});
