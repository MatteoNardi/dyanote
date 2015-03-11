'use strict';

angular.module('dyanote')

// Simulate a click on the node when a shortcut is pressed. 
// Example: 
// <button shortcut="ctrl+b">
// Example usage of shortcut-disabled:
// <button shortcut="ctrl+b" shortcut-disabled>
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
        if (attrs['shortcut-disabled']) return;
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
