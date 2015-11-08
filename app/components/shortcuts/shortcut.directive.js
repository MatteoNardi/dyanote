angular.module('dyanote')

// Simulate a click on the node when a shortcut is pressed.
// Example:
// <button shortcut="ctrl+b">
.directive('shortcut', function () {
  // Make sure we don't stop working when inside a text field.
  Mousetrap.prototype.stopCallback = function () {
    return false;
  };

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      // Bind shortcut to click event.
      var event = attrs.shortcutEvent || 'click';
      Mousetrap.bind(attrs.shortcut, function (e) {
        e.preventDefault();
        element.trigger(event);
      });

      // Avoid memory leaks.
      element.on('$destroy', function () {
        Mousetrap.unbind(attrs.shortcut);
      });
    }
  };
});
