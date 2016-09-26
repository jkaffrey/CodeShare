'use strict';
module.exports = {

    development: {
        client: 'pg',
        connection: {
          host: '127.0.0.1',
          database: 'codeshare'
        }
    },

    production: {
        client: 'pg',
        connection: {
          host: '127.0.0.1',
          database: 'codeshare'
        }
    }
};
