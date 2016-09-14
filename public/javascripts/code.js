'use strict';

$(function() {

  var id = window.location.pathname.match(new RegExp('[^/]+$')); //window.location.pathname.split('/')[2];
  console.log('id', id);
  var socket = io();

  var name = Math.random().toString(36).substring(4); //prompt('What is your name?'); //TODO: Change based off of login
  socket.emit('login', { user: name,  id: id });

  $('#roomName').html(id);

  $('#codeArea').keydown(function(event) {

    onKeyDown(event);
  });

  $('#codeArea').keyup(function(event) {

    // console.log(event.keyCode);
    socket.emit('codeChange', { key: $('#codeArea').html() });
  });

  $('#fileTree').on("changed.jstree", function (e, data) {

    console.log(data.selected);
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

      console.log(data.connected[i] != null);
      if (data.connected[i] != null) $('.users').prepend('<li>' + data.connected[i] + '</li>');
    }

    $('.numUsers').html(data.connected.length);
    $('.recentConnections').prepend('<li>' + data.who + ' <span class="green">connected</span>. [' + data.when + ']</li>');

    reduceEvents();
  });

  socket.on('userLeft', function(data) {

    $('.users').empty();
    for (var i = 0; i < data.connected.length; i++) {

      $('.users').prepend('<li>' + data.connected[i] + '</li>');
    }

    $('.numUsers').html(data.connected.length);
    $('.recentConnections').prepend('<li>' + data.user + ' <span class="red">disconnected</span>. [' + data.when + ']</li>');

    reduceEvents();
  });

  socket.on('connect', function() {

    socket.emit('load', id);
  });

  socket.on('codeChangeHappen', function(data) {

    // $('#codeArea').val($('#codeArea').val() + data.key);
    $('#codeArea').html(data.key);
  });
});

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

document.onmouseup = function() {

  var coords = getSelectionCoords();
  //var el = getCursorElement('123');
  //console.log(el.style);
  //el.style.left = coords.x;
  //el.style.top = coords.y;
  console.log(coords.x + ", " + coords.y);
};
