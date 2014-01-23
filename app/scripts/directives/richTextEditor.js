'use strict';

angular.module('dyanote')

// richTextEditor is a widget using wysihtml5
.directive('richTextEditor', function () {
  return {
    template: '<div><textarea></textarea></div>',
    restrict: 'E',
    replace: true,
    link: function postLink(scope, element, attrs) {
      scope.editor = new wysihtml5.Editor(element.find('textarea')[0], {
      });

      // Sync view -> model
      scope.editor.on('change', function () {
        console.log('Sync view -> model');
        scope.note.body = "<note>" + scope.editor.getValue() + "</note>";
        scope.$apply();
      });

      // Sync model -> view
      scope.$watch(attrs.ngModel, function (newValue, oldValue) { 
        var updatedValue = newValue.replace(/<\/?note>/gi, '');
        console.log(updatedValue); 
        element.find('textarea').html(updatedValue);
        scope.editor.setValue(updatedValue);
      });
    }
  };
});
