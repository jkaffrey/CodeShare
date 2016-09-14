'use strict';

exports.seed = function(knex, Promise) {

  return knex('repoPerms').del()
    .then(function () {
      return Promise.all([
        knex('repoPerms').insert(
          {
            repoName: 'simpleTest',
            user_id: 1,
            permission: 1
          }
        ),

        knex('repoPerms').insert(
          {
            repoName: 'simpleTest',
            user_id: 2,
            permission: 3
          }
        ),

        knex('repoPerms').insert(
          {
            repoName: 'simpleTest',
            user_id: 3,
            permission: 2
          }
        )
      ]);
    });
};
