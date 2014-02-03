asdasd = "asd";
angular.module('dyanote')

// richTextEditor is a widget using wysihtml5
.directive('note', function ($location) {

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
    templateUrl: 'views/note.html',
    restrict: 'E',
    replace: true,
    link: function postLink(scope, element, attrs) {
      asdasd = scope.editor = new wysihtml5.Editor(element.find('textarea')[0], {
        stylesheets: ['/styles/wysihtml5.css', 'http://fonts.googleapis.com/css?family=Gilda+Display'],
        style: false,
        parserRules:  parserRules,
        toolbar: element.find('toolbar')[0]
      });

      element.find('iframe').contents().on('click', 'a', function(event){
          event.preventDefault();
          var targetNoteId = event.target.getAttribute('href');
          var callerNoteId = scope.note.id;
          console.log('Note ' + callerNoteId + ' opens ' + targetNoteId);
          scope.$emit('$openNote', callerNoteId, targetNoteId);
          scope.$apply();
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
