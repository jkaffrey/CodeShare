'use strict';

var repl;

$(function() {

  $.get('/api/v1/generateToken', function(data) {

    console.log(data);
    var TOKEN = {msg_mac: data.msg_mac, time_created: data.time_created};
    repl = new ReplitClient('api.repl.it', 80, 'nodejs', TOKEN);
    repl.connect().then(
      function() { console.log('connected'); document.getElementById('consoleWorking').src = '../images/connected.png'; },
      function(err) { console.log('failed to connect', err); }
    );
  });
});

function runOnce() {

  repl.evaluateOnce(
    '1 == 1'
  )
  .then(
    function success(result) {
      if (result.error) {
        console.log('Error:', result.error);
      } else {
        console.log('Result', result.data);
      }
    },
    function error(error) {
      // There was an error connecting to the service :(
      console.error('Error connecting to repl.it');
    }
  );
}
