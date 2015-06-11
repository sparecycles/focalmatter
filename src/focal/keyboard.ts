var VK = {
  left:  37,
  up:    38,
  right: 39,
  down:  40,

  shift: 16,
  control: 17,
  option: 18,
};

for (var letter = 'A'.charCodeAt(0); letter <= 'Z'.charCodeAt(0); letter++) {
  VK[String.fromCharCode(letter)] = letter;
}

if (Object.freeze) {
  VK = Object.freeze(VK);
}

var keys = {};

document.onkeydown = function(event) {
  keys[event.keyCode] = true;
}

document.onkeyup = function(event) {
  delete keys[event.keyCode];
}

function keyboard(code) {
  return keyboard.keys[keyboard.vk[code]] || false;
}

module keyboard {
  export var vk = VK;
  export var keys = keys;
}

export = keyboard;
