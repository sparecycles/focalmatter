function evil(fmt, params) {
  return Function.apply(null,
    [].concat(params.args || []).concat(evil.format(fmt, params))
  ).apply(this, Array.prototype.slice.call(arguments, 2));
}

evil.format = function(fmt, params) {
  return fmt.replace(/{{([^}]*)}}/g, function(_, key) {
    return params[key] || '';
  });
}

exports.evil = evil;
