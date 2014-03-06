angular.module('dyanote')


// richTextEditor is a widget using wysihtml5
.directive('note', function ($location, $timeout, $window, SERVER_CONFIG) {

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

      // Create Editor
      scope.editor = new wysihtml5.Editor(element.find('textarea')[0], {
        stylesheets: [stylesheetUrl, 'http://fonts.googleapis.com/css?family=Gilda+Display'],
        style: false,
        parserRules:  parserRules,
      });

      // On destruction, unregister event handlers to avoid memory leaks.
      element.on('$destroy', function () {
        scope.editor.stopObserving();
        element.find('iframe').contents().off();
      });

      // When wysihtml5 is loaded, we do the DOM manipulation.
      scope.editor.on('load', function () {
        // Sync view -> model
        var updateModel = function () {
          var newValue = scope.editor.parse(scope.editor.getValue());
          if (scope.note.body != newValue) {
            console.log('Sync view -> model (' + scope.note.id + ')');
            console.log(newValue);
            scope.editor.setValue(newValue);
            scope.note.body = newValue;
            // Make AngularJS pickup changes
            $timeout(function () {});
          }
        }

        // Sync model -> view
        var updateView = function (newValue, oldValue) {
          newValue = scope.editor.parse(scope.note.body);
          scope.note.body = newValue;
          if (scope.editor.getValue() != newValue) {
            console.log('Sync model -> view (' + scope.note.id + ')');
            console.log(newValue);
            element.find('textarea').html(newValue);
            scope.editor.setValue(newValue);
          }
        }

        scope.editor.on('change', updateModel);
        scope.editor.on('aftercommand:composer', updateModel);
        scope.$apply(function () {
          scope.$watch('note.body', updateView);
        });

        // Intercept clicks on note links
        element.find('iframe').contents().on('click', 'a', function(event) {
          var href = event.target.getAttribute('href');
          if (href.indexOf(SERVER_CONFIG.apiUrl) == -1)
            $window.open(href);
          else {
            event.preventDefault();
            // Use a regex the get the note id, which is the last number in the href.
            var targetNoteId = href.match(/.*\/(\d+)\/$/)[1];
            var callerNoteId = scope.note.id;
            console.log('Note ' + callerNoteId + ' opens ' + targetNoteId);
            scope.$emit('$openNote', callerNoteId, targetNoteId);
            scope.$apply();
          }
        });

        // Scroll to note on directive creation...
        var scrollToNote = function () {
          jQuery("html").animate({scrollTop: element.offset().top - 90}, 400);
          // Note: this 90px magic number shoud be @navbar-height + @note-margin in style.less 
        };
        scrollToNote();
        // ... and when someone asks to.
        scope.$on('$scrollToNote', function (event, targetNote) {
          if (targetNote == scope.note)
            scrollToNote();
        });

        // Get Mousetrap to work within iframes.
        // https://github.com/ccampbell/mousetrap/issues/48
        Mousetrap.bindEventsTo(element.find('iframe').contents()[0]);
      });
    }
  };
});
