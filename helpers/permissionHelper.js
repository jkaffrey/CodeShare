'use strict';

module.exports = {

  owner: 0,
  admin: 1,
  editor: 2,
  viewer: 3,

  localizePermissions: function(intRep) {

    switch(intRep) {
      case 0: return 'Owner';
      case 1: return 'Admin';
      case 2: return 'Collaborator';
      case 3: return 'Viewer';
    }
  }
};
