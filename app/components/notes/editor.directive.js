


angular.module('dyanote')

// richTextEditor is a widget using Scribe (https://github.com/guardian/scribe),
// which basically is a wrapper around contentEditable.
// This directive setups Scribe, provides two-way data binding to note's body
// and adds basic behavior (clicking links and focusing notes)
.directive('editor', function ($location, $timeout, $window, $log, openNotes, notesGraph, notesManager, SERVER_CONFIG) {

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
      if (notesGraph.body(scope.note) != element.html()) {
        notesManager.setBody(scope.note, element.html());
        scope.$apply();
      }
    });
  }

  // Model -> View
  function setupModelViewSync (scope, element) {
    scope.$watch(_ => notesGraph.body(scope.note), html => {
      if (element.html() != html) {
        console.log('Sync model -> view (' + scope.note + ')');
        element.html(html);
      }
    });
  }

  function setupLinkClicking (scope, element) {
    // Intercept clicks on note links
    element.on('click', 'a', function(event) {
      var href = event.target.getAttribute('href');
      if (href[0] !== '#')
        $window.open(href);
      else {
        event.preventDefault();
        // Use a regex the get the note id, which is the last number in the href.
        var target = href.substring(1);
        console.log('Note ' + scope.note + ' opens ' + target);
        openNotes.openAfter(target, scope.note);
        openNotes.focus(target);
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
    var ownRange = document.createRange();
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

    document.addEventListener('selectionchange', () => {
      $timeout(onSelectionChanged, 0);
    });
  }

  // Inject in the parent scope the toolbar commands
  function setupCommands (scope, element) {
    var run = (command) => $timeout(function () {
      scope.scribe.commands[command].execute();
    }, 0, false);
    scope.commands = {
      link: () => run('link'),
      strong: () => run('strong'),
      em: () => run('em'),
      title: () => run('title'),
      insertUnorderedList: () => run('insertUnorderedList')
    };
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
