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

    res.render('index');
  });

  router.get('/profile', function(req, res, next) {

    checkJWT(req, res, next, req.session.userInfo);

    knex('repo_perms')
    .join('repo_info', 'repo_perms.repoName', '=', 'repo_info.repoName')
    .select('*')
    .where({user_id: req.session.userInfo.id})
    .then(function(data) {

      for (var i = 0; i < data.length; i++) {

        data[i].permission = pHelper.localizePermissions(data[i].permission);
        data[i].canEdit = data[i].permission === 'Admin' || data[i].permission === 'Owner' ? true : false;
        data[i].canDelete = data[i].permission === 'Owner' ? true : false;
        console.log(data[i]);
        // knex('repo_info')
        // .select('repoDescription')
        // .where({ repoName: data[i].repoName})
        // .then(function(dataO) {
        //
        //   if (data[i]) {
        //     data[i].description = dataO[0].repoDescription;
        //   }
        // });
      }

      res.render('profile', {
        userInfo: req.session.userInfo,
        userRepos: data
      });
    });
  });

  router.get('/editrepo/:id', function(req, res, next) {

    checkJWT(req, res, next, req.session.userInfo);
    knex('repo_info')
    .where({ repoName: req.params.id })
    .then(function(data) {

      knex('users')
      .select('firstname', 'lastname')
      .where({ id: data[0].owner_id })
      .then(function(ownerData) {

        // console.log(data[0]);
        /* Get all users who can access this repo */

        knex('repo_perms')
        .join('users', 'repo_perms.user_id',  '=', 'users.id')
        .select('users.id', 'repoName', 'firstname', 'lastname', 'permission')
        .where({ repoName:  req.params.id })
        .then(function(editors) {

          for (var i = 0; i < editors.length; i++) {

            editors[i].permission = pHelper.localizePermissions(editors[i].permission);
          }

          /* Get current users permissions */
          knex('repo_perms')
          .select('permission')
          .where({
            user_id: req.session.userInfo.id,
            repoName: req.params.id
          }).then(function(curPerms) {

            // console.log('My Perms!!!!!!', curPerms[0].permission === 0);
            res.render('repoEdit', { repoInfo: data[0], owner: ownerData[0].firstname + ' ' + ownerData[0].lastname, collaborators: editors, amIOwner: curPerms[0].permission === 0 });
          });
        });
      });
    });
  });

  router.get('/code', function(req, res, next) {

    checkJWT(req, res, next, req.session.userInfo);
    var uniqueId = Math.random().toString(36).substring(7);
    res.redirect('/code/' + uniqueId);
  });

  router.get('/code/:id', function(req, res, next) {

    checkJWT(req, res, next, req.session.userInfo);

    /* Check if repo already exists */
    knex('repo_info')
    .where({ repoName: req.params.id })
    .then(function(data) {

      if (data.length === 0) { //Repo doesnt exist

        /* Add repo to repoInfo
        *  Initalize with empty description
        */

        knex('repo_info')
        .insert({
          repoName: req.params.id,
          repoDescription: null,
          owner_id: req.session.userInfo.id,
          isPublic: true
        }).then(function (data) {

          /* Add user to repo_perms table as owner */

          knex('repo_perms')
          .insert({
            repoName: req.params.id,
            user_id: req.session.userInfo.id,
            permission: pHelper.owner
          }).then(function(data) {

            res.render('codeView', { directory: req.params.id });
          });
        });
      }


      /* Finally redirect the user to a working repo */
      /* Check if the user is allowed to access this repo */

      /* First check if repo is public */
      knex('repo_info')
      .where({ repoName: req.params.id })
      .then(function (data) {

        // console.log(data[0].isPublic);
        if (data[0] && !data[0].isPublic) {

          /* If user is guest, they can view all repos but not create them */
          if (req.session.userInfo.permission === 4) {

            res.render('codeView', { directory: req.params.id });
          }

          /* If repo is not public, check if user is allowed access */
          knex('repo_perms')
          .where(
            {
              repoName: req.params.id,
              user_id: req.session.userInfo.id
            }
          ).then(function(data) {

            if (data.length < 1) {

              /* if this is reached, current user is not allowed access, so redirect */
              // res.json({ error: eHelper.unauthorizedAccess });
              res.render('error', { error: eHelper.unauthorizedAccess });
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
  });

  //TODO: Socket.io code goes here
  var codeConnection = io.on('connection', function(socket) {

    socket.on('updateFView', function(data) {

      var dirTree = (path.resolve('./') + '/workDirectories/' + data.id);

      dHelper.getDirObj(dirTree, function(err, res){
        if(err) console.error(err);

        codeConnection.in(data.id).emit('updateFileView', { fileView: res });
      });
    });

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
        codeConnection.in(data.id).emit('welcomeEvent', { fileView: res, connected: users, who: socket.username, when: moment().format('LTS'), color: data.color } ); //Send a user a welcome message when they login
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

    socket.on('chatMessage', function(data) {

      console.log(data);
      socket.broadcast.to(socket.room).emit('newClientChatMessage', { user: data.user, message: data.message });
    });

    socket.on('codeChange', function(data) {

      var codeHi = data.key;
      socket.broadcast.to(socket.room).emit('codeChangeHappen', { key: codeHi, file: data.file });
    });

    socket.on('fileManip', function(data) {

      var dealingDir = data.dir.indexOf('.') >= 0 ? data.dir.match(new RegExp('^(.*[\\\/])'))[0] : data.dir;
      var isFile = data.dir.indexOf('.') >= 0 ? true : false;
      var fullPath = path.resolve('./') + '/workDirectories/' + dealingDir + data.name;
      var pathWithFileName = path.resolve('./') + '/workDirectories/' + data.dir;

      if (data.action === 'createFile') {

        fs.writeFile(fullPath, '', function(err) {

          if (err) console.log(err);
          else updateView(codeConnection, dealingDir);
        });
      } else if (data.action === 'createFolder') {

        fs.mkdirSync(fullPath);
        updateView(codeConnection, dealingDir);
      } else if (data.action === 'delete') {

        if (isFile) {

          fs.unlinkSync(pathWithFileName);
        } else {

          deleteFolderRecursive(pathWithFileName);
        }
        updateView(codeConnection, dealingDir);
      } else if (data.action === 'rename') {

        console.log(pathWithFileName, fullPath);
        fs.rename(pathWithFileName, fullPath, function(err) {

          if (err) throw err;
          else {

            updateView(codeConnection, dealingDir);
          }
        });
      } else  if (data.action === 'saveSingle') {

        fs.writeFile(pathWithFileName, data.text, function(err) {

          if (err) throw err;
          else {
            console.log('Save successful.');
          }
        });
      }
    });
  });

  return routerRet;
};

function updateView(codeConnection, dealingDir) {

  console.log('Updating views');

  var dirTree = (path.resolve('./') + '/workDirectories/' + dealingDir.match(new RegExp('[^\/]*'))[0]);
  dHelper.getDirObj(dirTree, function(err, res) {

    if(err) console.error(err);
    console.log('Please do things.');
    codeConnection.in(dealingDir.match(new RegExp('[^\/]*'))[0]).emit('updateFileView', { fileView: res });
  });
}

function deleteFolderRecursive(path) {

  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + '/' + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function checkJWT(req, res, next, newInfo) {

  var token = req.session.access_token;
  if (token) {

    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        return res.status(401).send({
          success: false,
          message: 'No token provided.'
        });
      } else {

        req.session.userInfo = newInfo || decoded;
        // console.log('Verified', req.session.userInfo);
        /* Check account verified */
        if (!req.session.userInfo.isVerified) {

          res.redirect('/');
        }
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
