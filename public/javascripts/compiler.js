'use strict';

var repl;

$(function() {

  $.get('/api/v1/generateToken', function(data) {

    console.log(data);
    var TOKEN = {msg_mac: data.msg_mac, time_created: data.time_created};
    repl = new ReplitClient('api.repl.it', 80, 'nodejs', TOKEN);
    //TODO: change replit-client compiler depending on file extension
    repl.connect().then(
      function() { console.log('connected'); document.getElementById('runCode').hidden = false; },
      function(err) { console.log('failed to connect', err); }
    );
  });
});

function runOnce() {

  // console.log(editor.session.getValue());
  var output = document.getElementById('consoleOutput');
  document.getElementById('runCode').hidden = true;
  document.getElementById('waitingCode').hidden = false;
  repl.evaluateOnce(
    // 'function helloWorld() { console.log(\'hello world\'); } helloWorld();'
    editor.session.getValue(), //document.getElementById('codeArea').textContent,
    {
      stdout: function(str) {

        output.innerHTML += str;
      }
    }
  )
  .then(
    function success(result) {

      output.innerHTML += (result.error || '');
      var psconsole = $('#consoleOutput');
      if(psconsole.length) {

        psconsole.scrollTop(psconsole[0].scrollHeight - psconsole.height());
      }

      document.getElementById('runCode').hidden = false;
      document.getElementById('waitingCode').hidden = true;
    },
    function error(error) {

      console.error('Error connecting to repl.it');
    }
  );
}
