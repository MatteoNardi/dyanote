asdasd = "asd";
angular.module('dyanote')

// richTextEditor is a widget using wysihtml5
.directive('richTextEditor', function () {

  // parserRules specifies the allowed tags
  var parserRules = {
    tags: {
      h1: {},
      strong: {},
      b:      {
        rename_tag: 'strong',
      },

      em:     {},
      i:      {
        rename_tag: 'em',
      },
      br:     {},
      div:    {},
      ul:     {},
      ol:     {},
      li:     {},
      a:      {
        check_attributes: {
          href: 'numbers'
        }
      }
    }
  };

  return {
    template: '<div class="richTextEditor"><textarea></textarea></div>',
    restrict: 'E',
    replace: true,
    link: function postLink(scope, element, attrs) {
      asdasd = scope.editor = new wysihtml5.Editor(element.find('textarea')[0], {
        stylesheets: ['/styles/wysihtml5.css', 'http://fonts.googleapis.com/css?family=Gilda+Display'],
        style: false,
        parserRules:  parserRules
      });

      // Sync view -> model
      scope.editor.on('change', function () {
        console.log('Sync view -> model');
        scope.note.body = "<note>" + scope.editor.parse(scope.editor.getValue()) + "</note>";
        scope.$apply();
      });

      // Sync model -> view
      scope.$watch(attrs.ngModel, function (newValue, oldValue) {
        var updatedValue = newValue.replace(/<\/?note>/gi, '');
        console.log('Sync model -> view');
        element.find('textarea').html(updatedValue);
        scope.editor.setValue(scope.editor.parse(updatedValue));
      });
    }
  };
});
