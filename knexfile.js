'use strict';
module.exports = {

    development: {
        client: 'pg',
        connection: process.env.DATABASE_URL || 'postgresql://localhost/codeshare'
    },

    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL || 'postgresql://localhost/codeshare'
    }

};
