var evil = require('./evil').evil;

classify.construct = function(definition, args) {
  var super_needed = false;
  var self = this;
  var result;
  if(definition.extend) {
    super_needed = true;
    classify.super = function() {
      classify.super = null;
      super_needed = false;
      return classify.construct.call(self, definition.extend, arguments);
    }
  }

  if(definition.constructor) {
    result = definition.constructor.apply(this, args);
  }

  if(super_needed) {
    classify.super = null;
    throw new Error("super call missing: " + definition.constructor);
  }

  return result;
}

function classify(name, definition) {
  var klass = evil([
    "function {{name}}() {",
    "  var self = this;",
    "  if(!(self instanceof {{name}})) self = Object.create({{name}}.prototype);",
    "  classify.construct.call(self, {{name}}, arguments);",
    "  return self;",
    "};",
    "return {{name}};"
  ].join('\n'), {
    name: name,
    args: "classify"
  }, classify);

  klass.constructor = definition.constructor;

  for(var key in definition) switch(key) {
  case 'extend':
    klass.extend = definition[key];
    klass.prototype = Object.create(klass.extend.prototype);
    break;
  case 'prototype':
    var proto = definition.prototype;
    for(var key in proto) {
      klass.prototype[key] = proto[key];
    }
    break;
  default:
    klass[key] = definition[key];
    break;
  }

  return klass;
}

exports.classify = classify;
