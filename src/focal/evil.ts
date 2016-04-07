function evil(fmt, params) {
  return Function.apply(null,
    [].concat(params.args || []).concat(evil.format(fmt, params))
  ).apply(this, Array.prototype.slice.call(arguments, 2));
}

namespace evil {
  export function format(fmt, params) {
    return fmt.replace(/{{([^}]*)}}/g, function(_, key) {
      return params[key] || '';
    });
  }
}

export default evil;