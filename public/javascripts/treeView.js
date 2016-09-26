'use strict';

var socket = io();

function getProject() {

  return window.location.pathname.match(new RegExp('[^/]+$'));
}

function getPath() {

  return getProject() + '/' + $('#fileTree').jstree(true).get_path($('#fileTree').jstree(true).get_selected(), '/');
}

function createFile() {

  var fileName = prompt('Please enter a file name.');
  if (getPath().indexOf('false') < 0) {

    console.log(getPath());
    socket.emit('fileManip', { action: 'createFile', dir: getPath() + '/', name: fileName });
  } else {

    socket.emit('fileManip', { action: 'createFile', dir: getProject() + '/', name: fileName });
  }
}

function createFolder() {

  var fileName = prompt('Please enter a folder name.');
  if (getPath().indexOf('false') < 0) {

    socket.emit('fileManip', { action: 'createFolder', dir: getPath() + '/', name: fileName });
  } else {

    socket.emit('fileManip', { action: 'createFolder', dir: getProject() + '/', name: fileName });
  }
}

function deleteItem() {

  if (getPath().indexOf('false') < 0) {

    socket.emit('fileManip', { action: 'delete', dir: getPath() });
  }
}

function renameItem() {

  var fileName = prompt('Please enter a new name.');
  if (getPath().indexOf('false') < 0) {

    socket.emit('fileManip', { action: 'rename', dir: getPath(), name: fileName });
  }
}

function saveFile() {

  if (getPath().indexOf('false' < 0)) {

    var toSave = editor.session.getValue();
    socket.emit('fileManip', { action: 'saveSingle', dir: getPath(), text: toSave });
  }
}

function sendMessage(user) {

  // $('#messageList').append('<li class="ownMessage">' + $('#theMessage').val() + '</li>');
  socket.emit('chatMessage', { user: user, message: $('#theMessage').val(), room: getProject()[0] });
  $('#theMessage').val('');
}

function saveAll() {

}

function refreshView() {

  socket.emit('fileManip', { action: 'updateView', dir: getPath() });
}
//
// function update_F_View() {
//
//   socket.emit('updateFView', { id: window.location.pathname.match(new RegExp('[^/]+$'))[0] });
// }
