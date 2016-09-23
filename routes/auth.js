'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const knex = require('../db/knex');
const jwt = require('jsonwebtoken');
// const multer = require('multer');
const errors = require('../helpers/errorStandards');
const emailAuth = require('../helpers/emailAuthHelper');

module.exports = function(router, multer, upload) {

  router.get('/verify/:id', function(req, res, next) {

    console.log('here');

    knex('users')
    .returning('*')
    .where({ uuid: req.params.id })
    .update({

      isVerified: true
    })
    .then(function(data) {

      delete data[0].password;
      delete data[0].securityAnswer;
      delete data[0].uuid;

      delete req.session.userInfo;
      req.session.userInfo = data[0];
      console.log(req.session.userInfo);
      res.redirect('../');
    });
  });

  router.get('/register', function(req, res, next) {

    res.render('signup');
  });

  router.post('/auth/signup', function(req, res) {

    // console.log(req.file);
    knex('users')
    .returning('*')
    .insert(
      {
        email: req.body.email,
        password: req.body.password,
        firstname: req.body.name.split(' ')[0],
        lastname: req.body.name.split(' ')[1],
        profilePicture: req.file ? req.file.path.replace('public', '') : '',
        securtyQuestion: req.body.securityQuestions,
        securityAnswer: req.body.securityAnswer,
        uuid: emailAuth.generateUUID()
      }
    ).then(function(data) {

      emailAuth.sendEmail(req.body.email, data[0].uuid);
      res.redirect('../');
    });
  });

  router.post('/auth/logout', function(req, res, next) {

    // console.log('Logging out');
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

          res.render('error', { error: errors.invalidPassword });
        }
      } else {

        res.render('error', { error: errors.invalidEmail });
      }
    });
  });
};
