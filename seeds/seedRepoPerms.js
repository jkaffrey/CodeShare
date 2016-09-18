'use strict';

exports.seed = function(knex, Promise) {

  return knex('repo_perms').del()
    .then(function () {
      return Promise.all([
        knex('repo_perms').insert(
          {
            repoName: 'simpleTest',
            user_id: 1,
            permission: 1
          }
        ),

        knex('repo_perms').insert(
          {
            repoName: 'simpleTest',
            user_id: 2,
            permission: 3
          }
        ),

        knex('repo_perms').insert(
          {
            repoName: 'simpleTest',
            user_id: 3,
            permission: 2
          }
        )
      ]);
    });
};
