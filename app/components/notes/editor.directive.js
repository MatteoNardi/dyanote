angular.module('dyanote')

// richTextEditor is a widget using Scribe (https://github.com/guardian/scribe),
// which basically is a wrapper around contentEditable.
// This directive setups Scribe, provides two-way data binding to note's body
// and adds basic behavior (clicking links and focusing notes)
.directive('editor', function ($location, $timeout, $window, $log, SERVER_CONFIG) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      
      // Setup Scribe
      require(['scribe'], function (Scribe) {
        var scribe = new Scribe(element[0], {
          allowBlockElements: false
        });
        // Use our plugin (defined in the scribeCommand directive)
        scribe.use(dyanote.scribe.plugin);
        element[0].scribe = scribe;
        $window['scribe' + scope.note.id] = scribe;
        element.on('focus', function () {
          scope.$parent.scribe = scribe;
        });
      });

      // TODO: we should validate markup!

      // Sync view -> model
      element.on('input', function () {
        if (scope.note.body != element.html()) {
          scope.note.body = element.html();
          scope.$apply();
        }
      });

      // Model -> View
      scope.$watch('note.body', function (newValue, oldValue) {
        if (element.html() != newValue) {
          console.log('Sync model -> view (' + scope.note.id + ')');
          element.html(newValue)
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
          scope.$emit('openNote', callerNoteId, targetNoteId);
          scope.$apply();
        }
      });

      // Scroll to note on directive creation...
      var scrollToNote = function () {
        jQuery("html,body").animate({scrollTop: element.parent().offset().top - 90}, 400);
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
