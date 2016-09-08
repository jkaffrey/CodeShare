'use strict';

$(function() {

  $('pre code').each(function(i, block) {
    
    hljs.highlightBlock(block);
  });

  var id = window.location.pathname.split('/')[2];
  var socket = io();

  socket.emit('login', { user: Math.random().toString(36).substring(3),  id: id });

  $("#codeArea").keypress(function(event) {

    console.log('Key down event fired.');
    socket.emit('codeChange', { key: $("#codeArea").html() });
  });

  socket.on('connect', function() {

    socket.emit('load', id);
  });

  socket.on('codeChangeHappen', function(data) {

    // $('#codeArea').val($('#codeArea').val() + data.key);
    $('#codeArea').html(data.key);
  });
});
