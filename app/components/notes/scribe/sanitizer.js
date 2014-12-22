'use strict';

dyanote.scribe.sanitizer = function (scribe) {
	var utils = dyanote.scribe.utils;

  // Fix block creation in list.
  // ie. if you press enter two times in a list, Chrome 
  // adds a <div> after it, while Firefox adds a <p>
	var ENTER_KEY = 13;
  scribe.el.addEventListener('keyup', function (event) {
    if (event.keyCode === ENTER_KEY) {
      var sel = new scribe.api.Selection();
      sel.placeMarkers();
      var blocks = scribe.el.querySelectorAll('div, p');
      for (var i = 0; i < blocks.length; ++i)
        utils.replaceWithChildren(blocks[i]);
      sel.selectMarkers(false);
    }
  });
};