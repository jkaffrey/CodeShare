'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const knex = require('../db/knex');
const jwt = require('jsonwebtoken');
// const multer = require('multer');
const errors = require('../helpers/errorStandards');

module.exports = function(router, multer, upload) {

  router.get('/register', function(req, res, next) {

    res.render('signup');
  });

  router.post('/auth/signup', function(req, res) {

    console.log(req.file);
    knex('users')
    .returning('*')
    .insert(
      {
        email: req.body.email,
        password: req.body.password,
        firstname: req.body.name.split(' ')[0],
        lastname: req.body.name.split(' ')[1],
        profilePicture: req.file.path.replace('public', '') || '',
        securtyQuestion: req.body.securityQuestions,
        securityAnswer: req.body.securityAnswer
      }
    ).then(function(data) {

      res.redirect('../');
    });
  });

  router.post('/auth/logout', function(req, res, next) {

    console.log('Logging out');
    req.session = null;
    res.redirect('../../');
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
          req.session.access_token = token;
          // console.log(token);

          req.session.userInfo = data;
          res.redirect('../../');
          // res.status(200).json({
          //   status: 'success',
          //   token: req.session.access_token,
          //   user: data
          // });
        } else {

          res.json({ error: errors.invalidPassword });
        }
      } else {

        res.json({ error: errors.invalidEmail });
      }
    });
  });
};
