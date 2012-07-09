var math = exports;
var classify = require('classify').classify;

math.sgn = function(x) {
  return x > 0 ? +1 : x < 0 ? -1 : 0;
}

math.abs = function(x) {
  return x >= 0 ? x : -x;
}

var Vec2 = math.Vec2 = classify("Vec2", {
  constructor: function(x,y) {
    this.x = x;
    this.y = y;
  },
  interpolate: function(p1, p2, t) {
    return Vec2(p2.x*t+p1.x*(1-t), p2.y*t+p1.y*(1-t));
  },
  prototype: {
    unit: function() {
      var P = this;
      var mag = P.mag();
      return mag == 0 ? P : P.mul(1/mag);
    },
    add: function(o) {
      var P = this;
      return Vec2(P.x + o.x, P.y + o.y);
    },
    neg: function() {
      var P = this;
      return Vec2(-P.x, -P.y);
    },
    sub: function(o) {
      var P = this;
      return Vec2(P.x - o.x, P.y - o.y);
    },
    to: function(o) {
      var P = this;
      return o.sub(P).unit();
    },
    mul: function(s) {
      var P = this;
      return Vec2(P.x*s, P.y*s);
    },
    mag: function() {
      return Math.sqrt(this.mag2());
    },
    mag2: function() {
      var P = this;
      return P.x*P.x + P.y*P.y;
    },
    dist: function(point) {
      return o.sub(this).mag();
    },
    dist2: function(o) {
      return o.sub(this).mag2();
    },
    toString: function() {
      var P = this;
      return P.x + "," + P.y;
    }
  }
});

Vec2.zero = Vec2(0,0);
Vec2.up = Vec2(0,-1);
Vec2.down = Vec2(0,+1);
Vec2.left = Vec2(-1,0);
Vec2.right = Vec2(+1,0);

var Ray = math.Ray = classify("Ray", {
  constructor: function(U,V,S,options) {
    options = options || {};
    if(options.normalize !== false) {
      var scale = Math.sqrt(U*U + V*V);
      U /= scale;
      V /= scale;
      S /= scale;
    }
    this.U = U;
    this.V = V;
    this.S = S;
    this.t0 = 0;
    if(options.origin) {
      this.origin = options.origin;
      this.t0 = this.project_t(options.origin);
    }
  },
  fromTo: function(a, b) {
    return Ray.fromDirectionAndPoint(b.sub(a).unit(), a);
  },
  fromDirectionAndPoint: function(dir, point) {
    var D = dir;
    var P = point;
    return new Ray(D.y, -D.x, P.x*D.y + P.y*-D.x, { normalize: false, origin: P });
  },
  prototype: {
    toString: function() {
      return "(" + this.at(0) + "-->" + this.direction() + ")";
    },
    value: function(point) {
      var P = point;
      var R = this;
      return P.x*R.U + P.y*R.V - R.S;
    },
    at: function(t) {
      var R = this;
      t += this.t0;
      return Vec2(R.U*R.S - R.V*t, R.V*R.S + R.U*t);
    },
    direction: function() {
      var R = this;
      return Vec2(-R.V, R.U);
    },
    project: function(point) {
      return this.at(this.project_t(point));
    },
    project_t: function(point) {
      var P = point;
      var R = this;
      return -R.V*P.x + R.U*P.y - R.t0;
    },
    transform: function(t, r) {
      var R = this;
      return R.at(t).add(Vec2(R.U*r, R.V*r));
    }
  }
});

var Shape = math.Shape = classify("Shape", {
  constructor: function(type) {
    if(!type) {
      throw new Error("Shape: missing type");
    }
    this.type = type;
  },
  prototype: {
    type: "<unknown>"
  }
})

var Circle = math.Circle = classify("Circle", {
  constructor: function(c,r) {
    classify.super("circle");

    this.c = c;
    this.r = r;
  },
  extend: Shape,
  prototype: {
    intersect: function(shape) {
      if(shape instanceof Shape) {
        var isect = this['intersect$' + shape.type];
        if(isect) {
          return isect.call(this, shape);
        }
      } else {
        throw new Error("Circle: intersect expects shape")
      }
    },
    intersect$circle: function(circle) {
      var result = {};
      var C1 = this;
      var C2 = circle;
      var distance2 = C1.c.dist2(C2.c);
      var d_radii = C1.r - C2.r;
      if(distance2 < d_radii*d_radii) {
        result.type = 'concentric';
        return result;
      }

      var radii = C1.r + C2.r;
      if(distance2 > radii*radii) {
        result.type = 'distinct';
        return result;
      }

      result.type = 'intersect';

      var r1_2 = C1.r*C1.r;
      var r2_2 = C2.r*C2.r;
      var space = result.space = Ray.fromDirectionAndPoint(Vec2(1,0), C1.c);
      var dc = space.project_t(C2.c);
      var m_x = (r1_2 - r2_2 + dc*dc)/(2*dc);
      var root = r1_2 - m_x*m_x;
      if(root > 0) {
        var height = Math.sqrt(root);
        result.middle = m_x;
        result.where = [ space.transform(m_x, height), space.transform(m_x, -height) ];
      } else {
        var where = space.at(C1.r);
        result.where = [ space.transform(m_x, 0), space.transform(m_x, -0) ];
      }
      return result;
    },
    eval: function(direction, height, flip) {
      var C = this;
      var sin = height/C.r;
      var cos = sin >= 1 ? 0 : Math.sqrt(1 - sin*sin);
      var center = C.c.add(direction.mul(cos*C.r));
      var d = direction.mul(height);
      var h = Vec2(-d.y, d.x);
      if(flip) h = h.neg();
      return [ center.add(h), center.sub(h) ];
    },
    intersects: function(ray) {
      var R = ray;
      var C = this;

      var e = R.value(C.c);
      if(C.r >= Math.abs(e)) {
        var t = R.project_t(C.c);
        var dt = Math.sqrt(C.r*C.r - e*e);
        return [t - dt, t + dt];
      }
    },
  }
});
