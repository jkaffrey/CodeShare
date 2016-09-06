'use strict';

module.exports = function(router, io) {

  router.get('/', function(req, res, next) {

    res.render('index', { title: 'Noooo' });
  });

  router.get('/code', function(req, res, next) {

    var uniqueId = Math.random().toString(36).substring(7);
    res.redirect('/code/' + uniqueId);
  });

  router.get('/code/:id', function(req, res, next) {

    res.render('codeView');
  });
};

function findClientsSocket(io, roomId, namespace) {
  
  var res = [],
  ns = io.of(namespace || '/');

  if (ns) {
    for (var id in ns.connected) {
      if(roomId) {
        var index = ns.connected[id].rooms.indexOf(roomId) ;
        if(index !== -1) {
          res.push(ns.connected[id]);
        }
      }
      else {
        res.push(ns.connected[id]);
      }
    }
  }
  return res;
}
