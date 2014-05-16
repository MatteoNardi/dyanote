// This is a Scribe plugin.
// This code is exported to the global namespace.
dyanote = {
  scribe: {
    utils: {
      // Utility functions will be inserted here
    },
    commands: {
      // Commands will be inserted here 
    },
    plugin: function (scribe) {
      scribe.use(dyanote.scribe.commands.link);
      // scribe.use(dyanote.scribe.commands.list);
      scribe.use(dyanote.scribe.commands.title);
    }
  }
};
