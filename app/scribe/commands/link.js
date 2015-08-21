
// Scribe plugin for linking to new notes.
// Expectations:
// Executing command when link is selected won't do anything.
// Todo: when multiple lines are selected, put their content in new note
dyanote.scribe.commands.link = function (scribe) {

  var utils = dyanote.scribe.utils;

  var command = scribe.commands.link = {};

  // Executes the command.
  command.execute = function () {
    var analysis = command.analyze();
    var data = analysis.data;
    // console.log(analysis);
    // return;

    if (!analysis.enabled)
      return;

    scribe.transactionManager.run(function () {
      var $scope = angular.element(scribe.el).scope(),
        injector = angular.element(document).injector(),
        notesManager = injector.get('notesManager');

      var parent = $scope.note;
      // Make the selected text (without formatting) as the title
      var title = data.title;
      var body = '';

      var note = notesManager.newNote(parent, title, body),
        link = '#' + note;
      console.info('note', note);

      document.execCommand("createLink", false, link);

      // Open note
      var openNotes = injector.get('openNotes');
      openNotes.openAfter(note, $scope.note);
      $scope.$digest();
    });
  };

  command.queryState = function () {
    // Clicking link two times won't undo it.
    return false;
  };

  command.queryEnabled = function () {
    return command.analyze().enabled;
  };

  // Analyzes the current selection and returns an object like this:
  // {
  //   enabled: wheather the command can be executed
  //   error: error message
  //   data: {
  //     title: title on the note which should be created
  //   }
  // }
  command.analyze = function () {
    var range = window.getSelection().getRangeAt(0);

    return {
      enabled: true,
      error: undefined,
      data: {
        title: range.toString()
      }
    };
  };
};
