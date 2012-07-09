var require = new function(system) {
  function require(p) {
    var path = require.resolve(p)
      , mod = require.modules[path]
      ;
    if(!mod) try {
      mod.exports = system(p);
    } catch(ex) {
      throw new Error("Failed to require '" + p + "'");
    } else if(!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  }

  require.modules = {};

  require.resolve = function(path) {
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js'
      ;

    return require.modules[orig] && orig 
      || require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  }

  require.define = function (path, fn){
    require.modules[path] = fn;
  };

  require.relative = function (parent) {
    return function(p){
      if ('.' != p[0]) return require(p);

      var path = parent.split('/')
        , segs = p.split('/')
        ;
      path.pop();

      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  };

  return require;
}(require);

