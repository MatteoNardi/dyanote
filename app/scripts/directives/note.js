angular.module('dyanote')


// richTextEditor is a widget using wysihtml5
.directive('note', function ($location, $timeout) {

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
          href: 'url'
        }
      }
    }
  };

  /* This is an ugly hack. 
   * We need the url of the css of our application since wysihtml5 is inside an iframe
   * and it doesn't inherit it.
   */
  var stylesheetUrl = jQuery('head link[href$="main.css"]')[0].href;

  return {
    templateUrl: 'views/note.html',
    restrict: 'E',
    replace: true,
    link: function postLink(scope, element, attrs) {

      scope.editor = new wysihtml5.Editor(element.find('textarea')[0], {
        stylesheets: [stylesheetUrl, 'http://fonts.googleapis.com/css?family=Gilda+Display'],
        style: false,
        parserRules:  parserRules,
      });

      // Sync view -> model
      var updateModel = function () {
        var newValue = scope.editor.parse(scope.editor.getValue());
        if (scope.note.body != newValue) {
          console.log('Sync view -> model (' + scope.note.id + ')');
          console.log(scope.note.body);
          console.log(newValue);
          scope.editor.setValue(newValue);
          $timeout(function () {
            scope.note.body = newValue;
          });
        }
      }

      // Sync model -> view
      var updateView = function (newValue, oldValue) {
        newValue = scope.editor.parse(scope.note.body);
        scope.note.body = newValue;
        if (scope.editor.getValue() != newValue) {
          console.log('Sync model -> view (' + scope.note.id + ')');
          console.log(scope.editor.getValue());
          console.log(newValue);
          element.find('textarea').html(newValue);
          scope.editor.setValue(newValue);
        }
      }

      scope.editor.on('change', updateModel);
      scope.editor.on('aftercommand:composer', updateModel);
      scope.$watch(attrs.ngModel, updateView);

      // Fixme: doesn't work on firefox: iframe is not loaded yet.
      element.find('iframe').contents().on('click', 'a', function(event){
          event.preventDefault();
          // Use a regex the get the note id, which is the last number in the href.
          var targetNoteId = event.target.getAttribute('href').match(/.*\/(\d+)\/$/)[1];
          var callerNoteId = scope.note.id;
          console.log('Note ' + callerNoteId + ' opens ' + targetNoteId);
          scope.$emit('$openNote', callerNoteId, targetNoteId);
          scope.$apply();
      });

      // Scroll to note on directive creation...
      var scrollToNote = function () {
        jQuery("html").animate({scrollTop: element.offset().top - 90}, 400);
        // Note: this 90px magic number shoud be @navbar-height + @note-margin in style.less 
      };
      scrollToNote();
      // ... and when someone asks to.
      scope.$on('$scrollToNote', function (event, targetNoteId) {
        if (targetNoteId == scope.note.id)
          scrollToNote();
      });

      // Todo: make sure these Observer patters don't cause memory leak.
    }
  };
});
