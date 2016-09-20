'use strict';

const subUrl = '/api/v1';
const knex = require('../db/knex');
const permHelper = require('../helpers/permissionHelper');
const errorHelper = require('../helpers/errorStandards');


module.exports = function(router, routerRet) {

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

  return routerRet;
};
