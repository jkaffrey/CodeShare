'use strict';

var Prism      = require('prismjs');
var fileStream = require('file-system');
var fs         = require('fs');
var path       = require('path');
var url        = require('url');
var dHelper     = require('../helpers/directoryHelper');

module.exports = function(router, io) {

  router.get('/', function(req, res, next) {

    res.render('index');
  });

  router.get('/code', function(req, res, next) {

    var uniqueId = Math.random().toString(36).substring(7);
    res.redirect('/code/' + uniqueId);
  });

  router.get('/code/:id', function(req, res, next) {

    /* This will create a directory within the file system to store all the files */
    if (!fs.existsSync(path.resolve('./') + '/workDirectories')) {

      fs.mkdirSync(path.resolve('./') + '/workDirectories');
    }

    if (!fs.existsSync(path.resolve('./') + '/workDirectories/' + req.params.id)) {
      fs.mkdirSync(path.resolve('./') + '/workDirectories/' + req.params.id);
    }

    // var dirTree = (path.resolve('./') + '/workDirectories/' + req.params.id);
    //
    // dHelper.getDirObj(dirTree, function(err, res){
    //   if(err)
    //     console.error(err);
    //
    //   console.log(JSON.stringify(res));
    // });

    res.render('codeView', { fileView: res });
  });

  //TODO: Socket.io code goes here
  var codeConnection = io.on('connection', function(socket) {

    socket.on('load', function(data) {

      var codeRoom = findClientsSocket(io, data);
    });

    socket.on('login', function(data) {

      var codeRoom = findClientsSocket(io, data); //codeRoom.length === number of people in room

      socket.username = data.user;
      socket.room = data.id;

      socket.join(data.id); // add the client to the code room

      var dirTree = (path.resolve('./') + '/workDirectories/' + data.id);

      dHelper.getDirObj(dirTree, function(err, res){
        if(err) console.error(err);

        console.log(res);
        codeConnection.in(data.id).emit('welcomeEvent', { fileView: res }); //Send a user a welcome message when they login
      });
    });

    socket.on('disconnect', function(data) {

      var codeRoom = findClientsSocket(io, data);

      // notify people when someone leaves the room
      console.log('Someone left', this.username);
      socket.broadcast.to(this.room).emit('userLeft', { room: this.room, user: this.username });
      socket.leave(socket.room);
    });

    socket.on('codeChange', function(data) {

      //console.log('Code change event received');
      var codeHi = data.key;//Prism.highlight(data.key, Prism.languages.javascript);
      // console.log(codeHi, '\n--');
      socket.broadcast.to(socket.room).emit('codeChangeHappen', { key: codeHi });
    });
  });
};

function findClientsSocket(io, roomId, namespace) {

  var res = [],
  ns = io.of(namespace || '/');

  if (ns) {
    for (var id in ns.connected) {
      if(roomId) {
        console.log(ns.connected[id].rooms);
        var index = ns.connected[id].rooms.hasOwnProperty(roomId);
        if(index !== -1) {
          res.push(ns.connected[id]);
        }
      }
      else {
        res.push(ns.connected[id]);
      }
    }
  }
  return res;
}
