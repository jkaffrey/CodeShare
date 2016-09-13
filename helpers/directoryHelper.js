'use strict';

var fs = require('fs');
var path = require('path');

var directoryTreeToObj = function(dir, done) {
  var results = [];

  fs.readdir(dir, function(err, list) {
    if (err)
    return done(err);

    var pending = list.length;

    if (!pending)
    return done(null, {text: path.basename(dir), type: 'folder', children: results});

    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          directoryTreeToObj(file, function(err, res) {
            results.push({
              text: path.basename(file),
              type: 'folder',
              children: res
            });
            if (!--pending)
            done(null, results);
          });
        }
        else {
          results.push({
            type: 'file',
            text: path.basename(file),
            icon : 'jstree-file'
          });
          if (!--pending)
          done(null, results);
        }
      });
    });
  });
};

module.exports = {

  getDirObj: directoryTreeToObj
};
