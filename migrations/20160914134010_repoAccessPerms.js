'use strict';

exports.up = function(knex, Promise) {

  return knex.schema.createTable('users', function(table) {

    table.increments('id');
    table.string('username');
    table.string('password');
    table.string('email');
    table.string('securtyQuestion');
    table.string('securityAnswer');
  });
};

exports.down = function(knex, Promise) {

  return knex.schema.dropTableIfExists('users');
};
