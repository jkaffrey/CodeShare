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

  return routerRet;
};
