'use strict';

// Fast Loading
function init() {
  var vidDefer = document.getElementsByTagName('iframe');
  for (var i=0; i<vidDefer.length; i++) {
    if(vidDefer[i].getAttribute('data-src')) {
      vidDefer[i].setAttribute('src',vidDefer[i].getAttribute('data-src'));
    }
  }
}

window.onload = init;
// drag move
$(function() {    $( '#fb_msg' ).draggable({ containment: 'window' }); });
// BUTTON
$(function(){
  $('#addClass').click(function () {
    $('#fb_msg').addClass('popup-on');
  });

  $('#removeClass').click(function () {
    $('#fb_msg').removeClass('popup-on');
  });
});
