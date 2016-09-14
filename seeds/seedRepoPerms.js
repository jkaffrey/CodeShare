'use strict';

exports.seed = function(knex, Promise) {

  return knex('repoPerms').del()
    .then(function () {
      return Promise.all([
        knex('repoPerms').insert({id: 1, colName: 'rowValue1'})
      ]);
    });
};
