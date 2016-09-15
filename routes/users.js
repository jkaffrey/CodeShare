'use strict';

const subUrl = '/api/v1';

module.exports = function(router, routerRet) {

  console.log('Hit it');
  router.get(subUrl + '/loggedInfo', function(req, res, next) {

    res.json(req.session.userInfo);
  });

  return routerRet;
};
