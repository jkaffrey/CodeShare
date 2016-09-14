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
              icon: 'https://cdn2.iconfinder.com/data/icons/thesquid-ink-40-free-flat-icon-pack/64/folder-16.png',
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
            icon : 'https://cdn2.iconfinder.com/data/icons/snipicons/500/file-16.png'
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
