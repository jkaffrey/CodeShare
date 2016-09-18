'use strict';

exports.up = function(knex, Promise) {

  return knex.schema.createTable('repo_info', function(table) {

    table.increments('id');
    table.string('repoName');
    table.text('repoDescription');
    table.integer('owner_id');
    table.boolean('isPublic').defaultTo(false);
  });
};

exports.down = function(knex, Promise) {

  return knex.schema.dropTableIfExists('repo_info');
};
