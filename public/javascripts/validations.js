'use strict';

const email = document.getElementById('email'),
      f_name = document.getElementById('name'),
      password = document.getElementById('password'),
      p_confirm = document.getElementById('confirm'),
      sa = document.getElementById('securityAnswer');

/* Email Validation */

f_name.addEventListener('keyup', function(event) {

  if (!f_name.validity.patternMismatch) {

    document.getElementById('errorName').style.display = 'none';
  }
});

f_name.addEventListener('focusout', function(event) {
  if (f_name.validity.patternMismatch) {

    document.getElementById('errorName').style.display = 'block';
  } else {

    document.getElementById('errorName').style.display = 'none';
  }
});

/* Email Validation */

email.addEventListener('keyup', function(event) {

  if (!email.validity.patternMismatch) {

    document.getElementById('errorEmail').style.display = 'none';
  }
});

email.addEventListener('focusout', function(event) {
  if (email.validity.patternMismatch) {

    document.getElementById('errorEmail').style.display = 'block';
  } else {

    document.getElementById('errorEmail').style.display = 'none';
  }
});

/* Password Validation */

password.addEventListener('keyup', function(event) {

  if (!password.validity.patternMismatch) {

    document.getElementById('errorPassword').style.display = 'none';
  }
});

password.addEventListener('focusout', function(event) {
  if (password.validity.patternMismatch) {

    document.getElementById('errorPassword').style.display = 'block';
  } else {

    document.getElementById('errorPassword').style.display = 'none';
  }
});

/* Confirm Password */

p_confirm.addEventListener('keyup', function(event) {

  if (!p_confirm.validity.patternMismatch) {
    if (p_confirm.value === password.value) {

      document.getElementById('errorConfirm').style.display = 'none';
    }
  }
});

p_confirm.addEventListener('focusout', function(event) {
  console.log(p_confirm.value, password.value);
  if (p_confirm.value !== password.value) {

    document.getElementById('errorConfirm').style.display = 'block';
  } else {

    document.getElementById('errorConfirm').style.display = 'none';
  }
});
