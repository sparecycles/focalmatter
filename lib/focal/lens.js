var lens = exports;
var classify = require('./classify').classify;
var math = require('./math');

var Vec2 = lens.Vec2 = math.Vec2;
var Ray = lens.Ray = math.Ray;
var Circle = lens.Circle = math.Circle;

function refract_spherical(ray, circle, height, intersection_point, out_p, index) {
  var R = ray;
  var P = intersection_point;

  if(Math.abs(P.y) > height) {
    return null;
  }

  var ray_direction = R.direction();
  var circle_direction = P.sub(circle.c).unit();

  if(out_p) {
    circle_direction = circle_direction.neg();
  }

  var incidence_sin = ray_direction.x*circle_direction.y - ray_direction.y*circle_direction.x;
  var refraction_sin = -incidence_sin*index;

  if(Math.abs(refraction_sin) > 1) {
    throw new Error('refraction');
  }

  var refraction_direction;

  var refraction_direction = Vec2(
    -circle_direction.x,
    -circle_direction.y
  );

  var angle = Vec2(Math.sqrt(1-refraction_sin*refraction_sin), refraction_sin);

  refraction_direction = Vec2(
    angle.x*refraction_direction.x + angle.y*refraction_direction.y,
  - angle.y*refraction_direction.x + angle.x*refraction_direction.y
  );

  return Ray.fromDirectionAndPoint(refraction_direction, P);
}

var Photon = exports.Photon = classify("Photon", {
  constructor: function(ray, wavelength, index) {
    this.ray = ray;
    this.wavelength = wavelength;
    this.index = index || 1;
  }
});

var SphericalSurface = exports.SphericalSurface = classify("SphericalSurface", {
  constructor: function(info) {
    this.info = info;
  },
  prototype: {
    trace: function(photon) {
      var intersect = this.info.circle.intersects(photon.ray);

      if(!intersect) {
        return null;
      }

      var index = this.info.material.index(photon.wavelength);
      var factor = photon.index/index;
      var ray = photon.ray;

      ray = refract_spherical(ray,
        this.info.circle,
        this.info.height,
        ray.at(intersect[this.info.front ? 0 : 1]),
        !this.info.front,
        factor
      );

      if(ray == null) {
        return null;
      }

      return new Photon(ray, photon.wavelength, index);
    }
  }
});

var Stop = exports.Stop = classify("Stop", {
  constructor: function(extents) {
    this.segment = math.Ray.fromTo(extents[0], extents[1]);
  },
  prototype: {
    trace: function(photon) {
      var intercept = this.segment.intercept(photon.ray);
      if(intercept > 0 && intercept < 1) {
        return photon;
      }

      return null;
    }   
  }
});

var Optic = exports.Optic = classify("Optic", {
  constructor: function(elements) {
    var surfaces = [];
    elements.forEach(function(element) { element.build(surfaces); });
    this.surfaces = surfaces;
  },
  prototype: {
    refract: function(ray, wavelength) {
      var photon = new Photon(ray, wavelength, 1);

      try {
        var photons = [photon];
        for(var sindex = 0; sindex < this.surfaces.length; sindex++) {
          var surface = this.surfaces[sindex];
          var refacted = surface.trace(photon);
          if(refacted) {
            photons.push(refacted);
            photon = refacted;
          } else return;
        }
        return photons.map(function(photon) { return photon.ray; });
      } catch(ex) {
        if(ex.message !== 'refraction') { console.error(ex); throw ex; }
      }
    }
  }
});
