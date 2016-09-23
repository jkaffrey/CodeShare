'use strict';

var editor = ace.edit('codeArea');

$(function() {

  var id = window.location.pathname.match(new RegExp('[^/]+$')); //window.location.pathname.split('/')[2];
  // console.log('id', id);
  var socket = io();

  editor.setOptions({
    enableBasicAutocompletion: true
  });
  editor.session.setMode('ace/mode/javascript');

  $.get('/api/v1/loggedInfo', function(data) {

    var name = data.firstname + ' ' + data.lastname; //Math.random().toString(36).substring(4); //prompt('What is your name?'); //TODO: Change based off of login
    socket.emit('login', { user: name,  id: id, color: randomColor() });
  });

  $('#roomName').html(id);

  $('#codeArea').keydown(function(event) {

    onKeyDown(event);
  });

  // $('#codeArea').keyup(function(event) {
  //
  //   // console.log(event.keyCode);
  //   console.log('Called...');
  //   socket.emit('codeChange', { key: $('#codeArea').html() });
  // });

  editor.session.on('change', function(data) {

    // console.log(editor.session.getValue());
    if (editor.curOp && editor.curOp.command.name) { // make sure this is a user change

      socket.emit('codeChange', { key: editor.session.getValue() });
    }
  });

  $('#fileTree').on("changed.jstree", function (e, data) {

    getFileFromServer('api/v1/getFile/' + id + '/' + $('#fileTree').jstree(true).get_path(data.selected, '/'), function(res) {

      // console.log(id + '/' + $('#fileTree').jstree(true).get_path(data.selected, '/'));
      var fileExtension = $('#fileTree').jstree(true).get_path(data.selected, '/').match(new RegExp('[^\.]+$'))[0];
      console.log(fileExtension);
      if (res) {

        //$('#codeArea').html(res);
        /* change editor view depending on file extension */
        if (fileExtension === 'js') {

          editor.session.setMode('ace/mode/javascript');
        } else if (fileExtension === 'css') {

          editor.session.setMode('ace/mode/css');
        } else if (fileExtension === 'scss') {

          editor.session.setMode('ace/mode/scss');
        } else if (fileExtension === 'php') {

          editor.session.setMode('ace/mode/php');
        } else if (fileExtension === 'java') {

          editor.session.setMode('ace/mode/java');
        } else if (fileExtension === 'md') {

          editor.session.setMode('ace/mode/markdown');
        } else if (fileExtension === 'json') {

          editor.session.setMode('ace/mode/json');
        } else if (fileExtension === 'html') {

          editor.session.setMode('ace/mode/html');
        } else if (fileExtension === 'hbs') {

          editor.session.setMode('ace/mode/handlebars');
        } else if (fileExtension === 'cpp') {

          editor.session.setMode('ace/mode/c_cpp');
        } else if (fileExtension === 'cs') {

          editor.session.setMode('ace/mode/csharp');
        } else if (fileExtension === 'c') {

          editor.session.setMode('ace/mode/c');
        }

        //var oData = res.replace(/(\r\n|\n|\r)/gm, '');
        console.log(res);
        editor.session.setValue(res);
      } else {

        editor.session.setValue('An error occurred.');
        // $('#codeArea').html('An error occurred.');
      }
    });
    // console.log(data.selected);
    // console.log(id + '/' + $('#fileTree').jstree(true).get_path(data.selected, '/'));
  });

  /* Begin Sockets */

  socket.on('welcomeEvent', function(data) {

    //alert(data.numIn);
    $('#fileTree').jstree(
      {
        'core' : {
          'data' : data.fileView
        }
      }
    );

    $('.users').empty();
    for (var i = 0; i < data.connected.length; i++) {

      console.log(data.connected[i]);
      if (data.connected[i] != null) $('.users').prepend('<li style="color: ' + data.color + '">' + data.connected[i] + '</li>');
    }

    $('.recentConnections').prepend('<li>' + data.who + ' <span class="green">connected</span>. [' + data.when + ']</li>');

    reduceEvents();
  });

  socket.on('userLeft', function(data) {

    $('.users').empty();
    for (var i = 0; i < data.connected.length; i++) {

      $('.users').prepend('<li>' + data.connected[i] + '</li>');
    }

    $('.recentConnections').prepend('<li>' + data.user + ' <span class="red">disconnected</span>. [' + data.when + ']</li>');

    reduceEvents();
  });

  socket.on('connect', function() {

    socket.emit('load', id);
  });

  socket.on('codeChangeHappen', function(data) {

    // $('#codeArea').val($('#codeArea').val() + data.key);
    // $('#codeArea').html(data.key);
    editor.session.setValue(data.key);
  });
});

function getFileFromServer(url, doneCallback) {
  var xhr;

  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = handleStateChange;
  xhr.open('GET', url, true);
  xhr.send();

  function handleStateChange() {
    if (xhr.readyState === 4) {
      doneCallback(xhr.status === 200 ? xhr.responseText : null);
    }
  }
}

function reduceEvents() {

  var listItems = $('.recentConnections').html().split('</li>');
  if (listItems.length > 5) {

    listItems = listItems.slice(0, 5);
  }

  $('.recentConnections').html(listItems.join('</li>'));
}

function onKeyDown(e) {

  if (e.keyCode === 9) {
    e.preventDefault();

    var editor = document.getElementById('codeArea');
    var doc = editor.ownerDocument.defaultView;
    var sel = doc.getSelection();

    var range = sel.getRangeAt(0);

    var tabNode = document.createTextNode('\u00a0\u00a0\u00a0\u00a0');
    range.insertNode(tabNode);

    range.setStartAfter(tabNode);
    range.setEndAfter(tabNode);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function getSelectionCoords(win) {
  win = win || window;
  var doc = win.document;
  var sel = doc.selection, range, rects, rect;
  var x = 0, y = 0;
  if (sel) {
    if (sel.type != "Control") {
      range = sel.createRange();
      range.collapse(true);
      x = range.boundingLeft;
      y = range.boundingTop;
    }
  } else if (win.getSelection) {
    sel = win.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange();
      if (range.getClientRects) {
        range.collapse(true);
        rects = range.getClientRects();
        if (rects.length > 0) {
          rect = rects[0];
        }
        x = rect.left;
        y = rect.top;
      }
      // Fall back to inserting a temporary element
      if (x == 0 && y == 0) {
        var span = doc.createElement("span");
        if (span.getClientRects) {
          // Ensure span has dimensions and position by
          // adding a zero-width space character
          span.appendChild( doc.createTextNode("\u200b") );
          range.insertNode(span);
          rect = span.getClientRects()[0];
          x = rect.left;
          y = rect.top;
          var spanParent = span.parentNode;
          spanParent.removeChild(span);

          // Glue any broken text nodes back together
          spanParent.normalize();
        }
      }
    }
  }
  return { x: x, y: y };
}

function randomColor() {

  return '#' + (function co(lor){   return (lor +=
  [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)]) &&
  (lor.length === 6) ?  lor : co(lor); })('');
}
