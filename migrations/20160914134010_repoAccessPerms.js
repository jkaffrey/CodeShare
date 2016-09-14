'use strict';

exports.up = function(knex, Promise) {

  return knex.schema.createTable('users', function(table) {

    table.increments('id');
    table.string('email');
    table.string('password');
    table.string('firstname');
    table.string('lastname');
    table.string('securtyQuestion');
    table.string('securityAnswer');
    table.string('profilePicture');
  });
};

exports.down = function(knex, Promise) {

  return knex.schema.dropTableIfExists('users');
};
