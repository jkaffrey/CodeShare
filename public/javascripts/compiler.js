'use strict';

var repl;

$(function() {

  $.get('/api/v1/generateToken', function(data) {

    console.log(data);
    var TOKEN = {msg_mac: data.msg_mac, time_created: data.time_created};
    repl = new ReplitClient('api.repl.it', 80, 'nodejs', TOKEN);
    repl.connect().then(
      function() { console.log('connected'); document.getElementById('runCode').hidden = false; },
      function(err) { console.log('failed to connect', err); }
    );
  });
});

function runOnce() {

  var output = document.getElementById('consoleOutput');
  repl.evaluateOnce(
    // 'function helloWorld() { console.log(\'hello world\'); } helloWorld();'
    document.getElementById('codeArea').textContent,
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
    },
    function error(error) {

      console.error('Error connecting to repl.it');
    }
  );
}
