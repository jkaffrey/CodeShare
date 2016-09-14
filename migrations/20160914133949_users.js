'use strict';

exports.up = function(knex, Promise) {

  return knex.schema.createTable('repoPerms', function(table) {

    table.increments('id');
    table.integer('user_id');
    table.integer('permission');
  });
};

exports.down = function(knex, Promise) {

  return knex.schema.dropTableIfExists('repoPerms');
};
