'use strict';

exports.up = function(knex, Promise) {

  return knex.schema.createTable('repo_perms', function(table) {

    table.increments('id');
    table.string('repoName');
    table.integer('user_id');
    table.integer('permission');
  });
};

exports.down = function(knex, Promise) {

  return knex.schema.dropTableIfExists('repo_perms');
};
