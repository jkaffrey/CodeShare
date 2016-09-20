'use strict';

function createUrl() {

  var val = document.getElementById('repoName');
  window.location.href = ('/code/' + val.value);
}
