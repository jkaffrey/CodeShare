'use strict';

// const errors = require('../../helpers/errorStandards');

/* Validation Errors */
const v_invalid_email = 'The email you have entered is not valid, please correct this before submitting.',
      v_invalid_name = 'The name you have entered is not valid, please enter your first and last name.',
      v_invalid_password = 'The password you have entered is not valid, passwords must have atleast one upper and lower case letter and a number.',
      v_invalid_match = 'The passwords that you have entered do not match',
      v_invalid_sa = 'You must answer the security question';

const email = document.getElementById('email'),
      f_name = document.getElementById('name'),
      password = document.getElementById('password'),
      p_confirm = document.getElementById('confirm'),
      sa = document.getElementById('securityAnswer');

/* Name Validation */

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

  console.log(email.validity);
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
  if (p_confirm.value !== password.value) {

    p_confirm.setCustomValidity('Passwords must match.');
    document.getElementById('errorConfirm').style.display = 'block';
  } else {

    p_confirm.setCustomValidity('');
    document.getElementById('errorConfirm').style.display = 'none';
  }
});
