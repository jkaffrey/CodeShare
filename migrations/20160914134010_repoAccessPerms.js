'use strict';

exports.up = function(knex, Promise) {

  // var uuid = generateUUID();

  return knex.schema.createTable('users', function(table) {

    table.increments('id');
    table.string('email');
    table.string('password');
    table.string('firstname');
    table.string('lastname');
    table.string('securtyQuestion');
    table.string('securityAnswer');
    table.string('profilePicture');
    table.boolean('isVerified').defaultTo(false);
    table.string('uuid');
  });
};

exports.down = function(knex, Promise) {

  return knex.schema.dropTableIfExists('users');
};
