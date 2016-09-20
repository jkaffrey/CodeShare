'use strict';

const collaborator = document.getElementById('collabEmail');

collaborator.addEventListener('keyup', function(event) {

  $.get('http://localhost:3000/api/v1/getUserByEmail/' + collaborator.value, function(data) {

    var options = '';
    for (var i = 0; i < data.length; i++) {

      options += '<option value="' + data[i].email + '">' + data[i].email + ' ' + data[i].firstname + ' ' + data[i].lastname + '</option>';
    }

    console.log(options);
    document.getElementById('collabSuggestions').innerHTML = options;
  });
});
