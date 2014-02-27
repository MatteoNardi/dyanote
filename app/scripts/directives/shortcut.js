'use strict';

angular.module('dyanote')

.directive('shortcut', function () {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      Mousetrap.bind(attrs.shortcut, function (e) {
        e.preventDefault();
        element.trigger('click');
      });

      element.on('$destroy', function () {
        Mousetrap.unbind(attrs.shortcut);
      })
    }
  };
});
