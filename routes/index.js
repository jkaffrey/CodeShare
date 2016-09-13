'use strict';

var Prism = require('prismjs');

module.exports = function(router, io) {

  router.get('/', function(req, res, next) {

    res.render('index');
  });

  router.get('/code', function(req, res, next) {

    var uniqueId = Math.random().toString(36).substring(7);
    res.redirect('/code/' + uniqueId);
  });

  router.get('/code/:id', function(req, res, next) {

    res.render('codeView');
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

      codeConnection.in(data.id).emit('welcomeEvent', { numIn: codeRoom.length }); //Send a user a welcome message when they login
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
