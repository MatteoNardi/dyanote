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
        toolbar: element.find('toolbar')[0]
      });

      // Fixme: doesn't work on firefox: iframe is not loaded yet.
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

      // Scroll to note on directive creation...
      var scrollToNote = function () {
        jQuery("body").animate({scrollTop: element.offset().top - 90}, 400);
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
