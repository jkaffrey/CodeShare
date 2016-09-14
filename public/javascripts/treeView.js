'use strict';

var socket = io();

function getProject() {

  return window.location.pathname.match(new RegExp('[^/]+$'));
}

function getPath() {

  return getProject() + '/' + $('#fileTree').jstree(true).get_path($('#fileTree').jstree(true).get_selected(), '/');
}

function createFile() {

  if (getPath().indexOf('false') < 0) {
    socket.emit('fileManip', { action: 'createFile', dir: getPath() });
  }
}

function createFolder() {

  if (getPath().indexOf('false') < 0) {
    socket.emit('fileManip', { action: 'createFolder', dir: getPath() });
  }
}
