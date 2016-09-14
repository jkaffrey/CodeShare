'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const knex = require('../db/knex');
const jwt = require('jsonwebtoken');
const errors = require('../helpers/errorStandards');

module.exports = function(router) {

  router.post('/auth/signup', function(req, res) {

    knex('users')
    .insert(
      {
        email: req.body.email,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        profilePicture: req.body.profileUrl,
        securityQuestion: req.body.securityQuestion,
        securityAnswer: req.body.securityAnswer
      }
    );
  });

  router.post('/auth/login', function(req, res, next) {

    knex('users')
    .where({ email: req.body.email })
    .first('*')
    .then(function(data) {

      if (data) {

        //TODO: implement bcrypt
        if (req.body.password === data.password) {

          delete data.password;
          delete data.securityAnswer;

          var token = jwt.sign(data, process.env.SECRET);
          res.status(200).json({
            status: 'success',
            token: token,
            user: data
          });
        } else {

          res.json({ error: errors.invalidPassword });
        }
      } else {

        res.json({ error: errors.invalidEmail });
      }
    });
  });
};
