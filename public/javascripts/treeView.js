'use strict';

function createFolder() {
  var ref = $('#fileTree').jstree(true),
  sel = ref.get_selected();
  if(!sel.length) { return false; }
  sel = sel[0];
  sel = ref.create_node(sel, {"type":"folder"});
  if(sel) {
    ref.edit(sel);
  }
}

function createFile() {

  console.log('called');
  var ref = $('#fileTree').jstree(),
  sel = ref.get_selected();
  if(!sel.length) { return false; }
  console.log('got here', ref);
  sel = sel[0];
  console.log('b4 broken', sel);
  sel = ref.create_node(sel, {type:"file"});
  console.log('broken', sel);
  if(sel) {
    ref.edit(sel);
  }
}

function rename() {
  var ref = $('#fileTree').jstree(),
  sel = ref.get_selected();
  if(!sel.length) { return false; }
  sel = sel[0];
  ref.edit(sel);
}

function deleteFunc() {
  var ref = $('#fileTree').jstree(),
  sel = ref.get_selected();
  if(!sel.length) { return false; }
  ref.delete_node(sel);
}
