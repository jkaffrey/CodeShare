'use strict';

const Prism      = require('prismjs');
const fileStream = require('file-system');
const fs         = require('fs');
const path       = require('path');
const url        = require('url');
const moment     = require('moment');
const jwt        = require('jsonwebtoken');
const knex       = require('../db/knex');
const dHelper    = require('../helpers/directoryHelper');
const pHelper    = require('../helpers/permissionHelper');
const eHelper    = require('../helpers/errorStandards');


module.exports = function(router, io, routerRet) {

  router.get('/', function(req, res, next) {

    console.log(req.session.userInfo);
    res.render('index');
  });

  // router.use(function(req, res, next) { checkJWT(req, res, next); });

  router.get('/code', function(req, res, next) {

    checkJWT(req, res, next);
    var uniqueId = Math.random().toString(36).substring(7);

    /* Add repo to repoInfo
    *  Initalize with empty description
    */

    knex('repo_info')
    .insert({
      repoName: uniqueId,
      repoDescription: '',
      owner_id: req.session.userInfo.id,
      isPublic: true
    }).then(function (data) {

      /* Add user to repo_perms table as owner */

      knex('repo_perms')
      .insert({
        repoName: uniqueId,
        user_id: req.session.userInfo.id,
        permission: pHelper.owner
      }).then(function(data) {

        /* Finally redirect the user to a working repo */
        res.redirect('/code/' + uniqueId);
      });
    });
  });

  router.get('/code/:id', function(req, res, next) {

    checkJWT(req, res, next);

    /* Check if the user is allowed to access this repo */

    /* First check if repo is public */
    knex('repo_info')
    .where({ repoName: req.params.id })
    .then(function (data) {

      console.log(data[0].isPublic);
      if (!data[0].isPublic) {

        /* If repo is not public, check if user is allowed access */
        console.log('Not public');
        knex('repo_perms')
        .where(
          {
            repoName: req.params.id,
            user_id: req.session.userInfo.id
          }
        ).then(function(data) {

          //res.json({ allowedAccess: data.length >= 1 ? true : false });
          if (data.length < 1) {

            /* if this is reached, current user is not allowed access, so redirect */
            res.json({ error: eHelper.unauthorizedAccess });
          } else {

            /* if this section is reached, the user is allowed access */
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
          }
        });
      } else {

        /* if this section is reached, the user is allowed access */
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
      }
    });
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

function checkJWT(req, res, next) {

  var token = req.session.access_token;
  if (token) {

    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        return res.status(401).send({
          success: false,
          message: 'No token provided.'
        });
      } else {

        req.session.userInfo = decoded;
      }
    });
  } else {

    return res.status(401).send({
      success: false,
      message: 'No token provided.'
    });
  }
}

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
