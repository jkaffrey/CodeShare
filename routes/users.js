'use strict';

const subUrl = '/api/v1';
const knex = require('../db/knex');

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

  return routerRet;
};
