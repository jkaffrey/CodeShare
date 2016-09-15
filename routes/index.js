'use strict';

var Prism      = require('prismjs');
var fileStream = require('file-system');
var fs         = require('fs');
var path       = require('path');
var url        = require('url');
var moment     = require('moment');
var expressJWT = require('express-jwt');
var dHelper     = require('../helpers/directoryHelper');

module.exports = function(router, io, routerRet) {

  router.get('/', function(req, res, next) {

    res.render('index');
  });

  router.get('/code', expressJWT({ secret: process.env.SECRET }), function(req, res, next) {

    var uniqueId = Math.random().toString(36).substring(7);
    res.redirect('/code/' + uniqueId);
  });

  router.get('/code/:id', expressJWT({ secret: process.env.SECRET }), function(req, res, next) {

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

    res.render('codeView', { directory: req.params.id });
  });

  //TODO: Socket.io code goes here
  var codeConnection = io.on('connection', function(socket) {

    socket.on('load', function(data) {

      var codeRoom = findClientsSocket(io, data);
    });

    socket.on('login', function(data) {

      socket.username = data.user;
      socket.room = data.id;

      // console.log('username', data.user);
      // console.log('socket name', socket.username);

      socket.join(data.id); // add the client to the code room

      var codeRoom = findClientsSocket(io, data); //codeRoom.length === number of people in room
      var users = [];

      for (var i = 0; i < codeRoom.length; i++) {

        users.push(codeRoom[i].username);
      }

      var dirTree = (path.resolve('./') + '/workDirectories/' + data.id);

      dHelper.getDirObj(dirTree, function(err, res){
        if(err) console.error(err);

        // console.log(res);
        // console.log('name:', codeRoom[0]);
        codeConnection.in(data.id).emit('welcomeEvent', { fileView: res, connected: users, who: socket.username, when: moment().format('LTS') }); //Send a user a welcome message when they login
      });

      // console.log(moment(moment().format('LTS'), 'hh:mm:ss a').fromNow());
    });

    socket.on('disconnect', function(data) {

      var codeRoom = findClientsSocket(io, data);

      var users = [];

      for (var i = 0; i < codeRoom.length; i++) {

        if (codeRoom[i].username != null) users.push(codeRoom[i].username);
      }

      socket.broadcast.to(this.room).emit('userLeft', { room: this.room, user: this.username, connected: users, when: moment().format('LTS') });
      socket.leave(socket.room);
    });

    socket.on('codeChange', function(data) {

      //console.log('Code change event received');
      var codeHi = data.key;//Prism.highlight(data.key, Prism.languages.javascript);
      // console.log(codeHi, '\n--');
      socket.broadcast.to(socket.room).emit('codeChangeHappen', { key: codeHi });
    });

    socket.on('fileManip', function(data) {

      console.log(JSON.stringify(data));
    });
  });

  return routerRet;
};

function findClientsSocket(io, roomId, namespace) {

  var res = [],
  ns = io.of(namespace || '/');

  if (ns) {
    for (var id in ns.connected) {
      if(roomId) {
        console.log(ns.connected[id].rooms);
        var index = ns.connected[id].rooms.hasOwnProperty(roomId);
        if(index !== -1 && ns.connected[id] != null) {
          res.push(ns.connected[id]);
        }
      }
      else {
        if (ns.connected[id] != null) {
          res.push(ns.connected[id]);
        }
      }
    }
  }
  return res;
}
