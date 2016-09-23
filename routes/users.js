'use strict';

const subUrl = '/api/v1';
const knex = require('../db/knex');
const permHelper = require('../helpers/permissionHelper');
const errorHelper = require('../helpers/errorStandards');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


module.exports = function(router, routerRet) {

  // router.get(subUrl + '/getFile/:directory/:filename', function(req, res, next) {
  router.get(/\/api\/v1\/getFile((\/\w+)*\.\w+)$/, function(req, res, next) {

    // res.json(req.params);
    fs.readFile(path.resolve('./') + '/workDirectories' + req.params[0], 'utf8', (err, data) => {

      if (err) res.json(err);
      res.write(data ? data : ('//File: ' + req.params[1].replace('/', '')));
      res.end();
    });
  });

  router.get(subUrl + '/generateToken', function(req, res, next) {

    var cTime = new Date().getTime();
    const hash = crypto.createHmac('sha256', process.env.REPLIT_SECRET).update(cTime + '').digest('base64');

    res.json({
      msg_mac: hash,
      time_created: cTime
    });
  });

  router.get(subUrl + '/loggedInfo', function(req, res, next) {

    res.json(req.session.userInfo);
  });

  router.get(subUrl + '/userExists/:email', function(req, res, next) {

    knex
    .select('email')
    .from('users')
    .where({ email: req.params.email })
    .then(function(data) {

      res.json( { isUser: data.length === 1 ? true : false } );
    });
  });

  router.get(subUrl + '/getUserById/:id', function(req, res, next) {

    knex('users')
    .where({id: req.params.id})
    .then(function(data) {

      res.json(data);
    });
  });

  router.get(subUrl + '/getRepos/:id', function(req, res, next) {

    knex('repo_perms')
    .where({user_id: req.params.id})
    .then(function(data) {

      res.json(data);
    });
  });

  router.get(subUrl + '/getReposInfo/:id', function(req, res, next) {

    knex('repo_info')
    .where({repoName: req.params.id})
    .then(function(data) {

      res.json(data);
    });
  });

  router.get(subUrl + '/getUserByEmail/:id', function(req, res, next) {

    knex('users')
    .select('id', 'firstname', 'lastname', 'email')
    .where('email', 'like', '%' + req.params.id + '%')
    .timeout(500)
    .then(function(data) {

      res.json(data);
    });
  });

  router.post(subUrl + '/addCollaborator/:id', function(req, res, next) {

    console.log(req.session);
    knex('repo_perms')
    .where({
      repoName: req.params.id,
      user_id: req.session.userInfo.id
    })
    .then(function(data) {

      if (data.length === 0 || data[0].permission > 1) {

        /* Cannot modify permissions */
        res.render('error', { error: errorHelper.invalidPermissions });
      } else {

        /* Can modify permissions */
        knex('users')
        .select('id')
        .where({
          email: req.body.collabEmail
        })
        .then(function(userId) {
          // console.log('ID!!!!!!!', userId);
          knex('repo_perms')
          .insert({
            repoName: req.params.id,
            user_id: userId[0].id,
            permission: permHelper.unlocalizePermissions(req.body.collabPerms)
          }).then(function() {

            res.redirect('/editrepo/' + req.params.id);
          });
        });
      }
    });
    // console.log(req.body, permHelper.unlocalizePermissions(req.body.collabPerms));
  });

  router.post(subUrl + '/updaterepo/:id', function(req, res, next) {

    knex('repo_perms')
    .where({
      repoName: req.params.id,
      user_id: req.session.userInfo.id
    })
    .then(function(data) {

      if (data.length === 0 || data[0].permission > 1) {

        /* Cannot modify permissions */
        res.render('error', { error: errorHelper.invalidPermissions });
      } else {

        console.log(req.body);
        knex('repo_info')
        .where({ repoName: req.params.id})
        .update({
          repoName: req.body.repoName,
          repoDescription: req.body.repoDescription,
          isPublic: req.body.repoPublic === 'true' ? true : false
        }).then(function() {

          //TODO: update repo_perms table with new names as well
          knex('repo_perms')
          .where({ repoName: req.params.id })
          .update( { repoName: req.body.repoName } )
          .then(function() {

            res.redirect('/editrepo/' + req.body.repoName);
          });
        });
      }
    });

  });

  router.post(subUrl + '/deleterepo/:id', function(req, res, next) {

    knex('repo_perms')
    .where({
      repoName: req.params.id,
      user_id: req.session.userInfo.id
    })
    .then(function(data) {

      if (data.length === 0 || data[0].permission > 1) {

        /* Cannot modify permissions */
        res.render('error', { error: errorHelper.invalidPermissions });
      } else {

        // console.log(req.body);
        knex('repo_info')
        .where({ repoName: req.params.id})
        .del()
        .then(function() {

          //TODO: update repo_perms table with new names as well
          knex('repo_perms')
          .where({ repoName: req.params.id })
          .del()
          .then(function() {

            res.redirect('/profile');
          });
        });
      }
    });

  });

  return routerRet;
};
