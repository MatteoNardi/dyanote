


angular.module('dyanote')

// richTextEditor is a widget using Scribe (https://github.com/guardian/scribe),
// which basically is a wrapper around contentEditable.
// This directive setups Scribe, provides two-way data binding to note's body
// and adds basic behavior (clicking links and focusing notes)
.directive('editor', function ($location, $timeout, $window, $log, openNotes, notesGraph, SERVER_CONFIG) {

  // Setup Scribe editor
  function setupScribe (scope, element) {
    require(['scribe'], function (Scribe) {
      var scribe = new Scribe(element[0], {
        allowBlockElements: false
      });
      // Use our plugin (defined in the scribeCommand directive)
      scribe.use(dyanote.scribe.plugin);
      scope.scribe = scribe;
    });
  }

  // Sync view -> model
  function setupViewModelSync (scope, element) {
    element.on('input', function () {
      if (scope.note.body != element.html()) {
        scope.note.body = element.html();
        scope.$apply();
      }
    });
  }

  // Model -> View
  function setupModelViewSync (scope, element) {
    scope.$watch('note.body', function (newValue, oldValue) {
      if (element.html() != newValue) {
        console.log('Sync model -> view (' + scope.note.id + ')');
        element.html(newValue)
      }
    });
  }

  function setupLinkClicking (scope, element) {
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
        var targetNote = notesGraph.getById(targetNoteId);
        var callerNote = notesGraph.getById(callerNoteId);
        console.log('Note ' + callerNoteId + ' opens ' + targetNoteId);
        openNotes.openAfter(targetNote, callerNote);
        openNotes.focus(targetNote);
        scope.$apply();
      }
    });
  }

  function setupAnimatedScrolling (scope, element) {
    var focusHandler = (note) => {
      if (note == scope.note) {
        jQuery("html,body").animate({scrollTop: element.parent().offset().top - 90}, 400);
        // Note: this 90px magic number shoud be @navbar-height + @note-margin in style.less 
      }
    };
    openNotes.addFocusHandler(focusHandler);
    element.on('$destroy', () => { openNotes.removeFocusHandler(focusHandler); });
    openNotes.focus(scope.note);
  }

  // Show overlay toolbar on selection change.
  function setupToolbar (scope, element) {
    var ownRange = document.createRange()
    ownRange.setStartBefore(element[0]);
    ownRange.setEndAfter(element[0]);

    scope.toolbar = scope.toolbar || {};
    var onSelectionChanged = function () {
      scope.toolbar.show = false;
      var selection = $window.getSelection();
      if (selection.rangeCount != 1) return;
      var selected = selection.getRangeAt(0),
        startsInside = selected.compareBoundaryPoints(Range.START_TO_START, ownRange) >= 0,
        endsInside = selected.compareBoundaryPoints(Range.END_TO_END, ownRange) <= 0,
        hasText = selected.toString().length > 0;
      if (startsInside && endsInside && hasText) {
        var toolbar = element[0].parentNode.querySelector('.toolbar'),
          toolbarWidth = toolbar.getBoundingClientRect().width,
          rect = selected.getBoundingClientRect();
        scope.toolbar.show = true;
        scope.toolbar.X = Math.floor(rect.left + rect.width/2 - toolbarWidth/2);
        scope.toolbar.Y = Math.floor(rect.top - 40);
      }
      scope.$digest();
    };

    // Add complicated handlers for detecting selection changes
    element.on('keyup', onSelectionChanged);
    var onMouseUp = function () {
      document.body.removeEventListener('mouseup', onMouseUp);
      $timeout(onSelectionChanged, 0);
    }
    element.on('blur', () => {
      document.body.removeEventListener('mouseup', onMouseUp);
      scope.toolbar.show = false;
      scope.$digest();
    });
    element.on('mousedown', () => {
      document.body.addEventListener('mouseup', onMouseUp)
    });
  }

  // Inject in the parent scope the toolbar commands
  function setupCommands (scope, element) {
    scope.commands = {
      link: () => scope.scribe.commands['link'].execute(),
      strong: () => scope.scribe.commands['strong'].execute(),
      em: () => scope.scribe.commands['em'].execute(),
      title: () => scope.scribe.commands['title'].execute(),
      insertUnorderedList: () => scope.scribe.commands['insertUnorderedList'].execute()
    }
  }

  return {
    restrict: 'A',
    link: function (scope, element) {
      setupScribe(scope, element);
      setupViewModelSync(scope, element);
      setupModelViewSync(scope, element);
      // TODO: we should validate markup!
      setupLinkClicking(scope, element);
      setupAnimatedScrolling(scope, element);
      setupToolbar(scope, element);
      setupCommands(scope, element);
      // Focus element
      $timeout(() => element.focus(), 0, false);
    }
  };
});
