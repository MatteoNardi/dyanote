angular.module('dyanote')

// richTextEditor is a widget using Scribe
.directive('note', function ($location, $timeout, $window, $log) {
  return {
    templateUrl: 'views/note.html',
    restrict: 'E',
    replace: true,
    link: function postLink(scope, element, attrs) {
      
      var editor = element.find('.richTextEditor');

      // Setup Scribe
      require(['scribe'], function (Scribe) {
        var scribe = new Scribe(editor[0], {
          allowBlockElements: false
        });
        $window['scribe' + scope.note.id] = scribe;
      });

      // On destruction, unregister event handlers to avoid memory leaks.
      element.on('$destroy', function () {
        element.off();
        editor.off();
      });

      // TODO: we should validate markup!

      // Sync view -> model
      editor.on('input', function () {
        if (scope.note.body != editor.html()) {
          scope.note.body = editor.html();
        }
      });

      // Model -> View
      scope.$watch('note.body', function (newValue, oldValue) {
        if (editor.html() != newValue) {
          console.log('Sync model -> view (' + scope.note.id + ')');
          editor.html(newValue)
        }
      });

      // Intercept clicks on note links
      element.on('click', 'a', function(event) {
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
        jQuery("html,body").animate({scrollTop: element.offset().top - 90}, 400);
        // Note: this 90px magic number shoud be @navbar-height + @note-margin in style.less 
      };
      scrollToNote();
      // ... and when someone asks to.
      scope.$on('$scrollToNote', function (event, targetNote) {
        if (targetNote == scope.note)
          scrollToNote();
      });
    }
  };
});
