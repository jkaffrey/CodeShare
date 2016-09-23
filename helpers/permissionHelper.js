'use strict';

module.exports = {

  owner: 0,
  admin: 1,
  editor: 2,
  viewer: 3,
  guest: 4,

  localizePermissions: function(intRep) {

    switch(intRep) {
      case 0: return 'Owner';
      case 1: return 'Admin';
      case 2: return 'Collaborator';
      case 3: return 'Viewer';
      case 4: return 'Guest';
    }
  },

  unlocalizePermissions: function(intRep) {

    switch(intRep) {
      case 'Owner': return 0;
      case 'Admin': return 1;
      case 'Collaborator': return 2;
      case 'Viewer': return 3;
      case 'Guest': return 4;
    }
  }
};
