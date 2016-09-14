'use strict';

exports.seed = function(knex, Promise) {

  return knex('users').del()
    .then(function () {
      return Promise.all([
        knex('users').insert(
          {
            email: 'j@kaffrey.com',
            password: '1234',
            firstname: 'Jeremy',
            lastname: 'Kaffrey',
            securtyQuestion: 'Name of first school?',
            securityAnswer: '1234',
            profilePicture: null
          }
        ),

        knex('users').insert(
          {
            email: 'a@kaffrey.com',
            firstname: 'Aaron',
            lastname: 'Kaffrey',
            password: '1234',
            securtyQuestion: 'Name of first pet?',
            securityAnswer: '1234',
            profilePicture: null
          }
        ),

        knex('users').insert(
          {
            email: 'z@kaffrey.com',
            firstname: 'Zachary',
            lastname: 'Kaffrey',
            password: '1234',
            securtyQuestion: 'Mothers maiden name?',
            securityAnswer: '1234',
            profilePicture: null
          }
        )
      ]);
    });
};
