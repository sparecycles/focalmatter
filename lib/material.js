var material = exports || {};
var classify = require('classify').classify;

var StandardWavelengths = material.StandardWavelengths = {
  d: 587.6,
  F: 486.1,
  C: 656.3,
  i: 365.0,
  t: 1014.0,
};

material.colorFromWavelength = function(wavelength) {
  var blue = [[425,540,1,1]];
  var green = [[530,720,1/1.3,1]];
  var red = [[600,800,1/2,1],[380,420,1,.3]];

  function factor(datas) {
    var sum = 0;
    datas.forEach(function(data) { 
      var x = (wavelength - data[0])/(data[1]-data[0]);
      sum += Math.pow(Math.exp(-Math.PI*x*x), data[2])*data[3]; 
    });
    return sum;
  }

  var rgb = [factor(red), factor(green), factor(blue)];
  var max = Math.max(rgb[0], rgb[1], rgb[2]);
  
  if(max > 1) {
    rgb[0] /= max;
    rgb[1] /= max;
    rgb[2] /= max;
  }

  return rgb.map(function(factor) {
    return Math.min(Math.max(Math.min(factor, 1), 0) * 256 | 0, 255);
  });
}

material.rgbFromWavelength = function(wavelength) {
  return "rgb(" + material.colorFromWavelength(wavelength).join(',') + ")";
}

function DeAbbe(n_d, v_d) {
  var A = (n_d - 1)/v_d/(1/StandardWavelengths.F - 1/StandardWavelengths.C);
  var B = n_d - A/StandardWavelengths.d;
  return function(u) {
    return A/u + B;
  }
}

var Material = material.Material = classify("Material", {
  constructor: function(index) {
    if(typeof index === 'function') {
      this.index = index;
    } else if(index != null) {
      this.index = function(wavelength) { return index; };
    }
  },
  prototype: {
    index: function(wavelength) {
      return 1;
    }
  }
});

Material.Air = new Material();

function indexForStandardDispersion(data) {
  var nd, vd;

  nd = data.nd;

  if(data.vd != null) {
    vd = data.vd;
  } else if(data.nF != null && data.nC != null) {
    vd = (data.nd - 1)/(data.nF - data.nC)
  }

  return DeAbbe(nd, vd);
}

Material.Glass = classify("Glass", {
  constructor: function(indexfn) {
    this.index = indexfn;
  },

  base: Material,

  fromGlassCode: function(code) {
    var nd = parseInt(code.substr(0,3), 10)/100 + 1.0;
    var vd = parseInt(code.substr(3,3), 10)/10;
    return new Material.Glass(indexForStandardDispersion({
      nd: nd,
      vd: vd
    }));
  },
  Schott: function(name) {
    var shott_glass = Schott[name];
    return new Material.Glass(indexForStandardDispersion({
      vd: shott_glass.vd,
      nd: shott_glass.nd 
    }));
  },
  prototype: {
    index: function(frequency) {
      throw new Error("unimplemented");
    }
  }
});

var Schott = {
  'P-BK7': {
    code: '516641',
    nd: 1.516,
    vd: 64.06
  },
  'F2': {
    nd: 1.62004,
    vd: 36.37
  }
};
