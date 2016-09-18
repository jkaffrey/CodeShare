'use strict';

exports.up = function(knex, Promise) {

  return knex.schema.createTable('repoInfo', function(table) {

    table.increments('id');
    table.string('repoName');
    table.text('repoDescription');
    table.boolean('isPublic');
  });
};

exports.down = function(knex, Promise) {

  return knex.schema.dropTableIfExists('repoInfo');
};
