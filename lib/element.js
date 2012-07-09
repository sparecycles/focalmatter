var classify = require('classify.js').classify
  , lens = require('lens.js')
  , Material = require('material.js').Material
  ;

var Element = exports.Element = classify('Element', {
  constructor: function(data /* r1,r2,t,index,height? */) {
    var radius = data.radius;
    if(typeof radius === 'number') {
      radius = [radius,radius];
    }
    var r1 = this.r1 = radius[0];
    var r2 = this.r2 = radius[1];
    var front = this.front = data.front;
    var back = this.back = front + data.depth;
    var c1 = this.c1 = front + r1;
    var c2 = this.c2 = back - r2;
    var height = data.height;
    var optic = this.optic = [
      { circle: lens.Circle(lens.Vec2(c1,0), Math.abs(r1)),
        material: data.material || Material.Air,
        front: r1 > 0,
        negative: r1 < 0 ? 1 : 0,
        height: height
      },
      { circle: lens.Circle(lens.Vec2(c2,0), Math.abs(r2)),
        material: Material.Air,
        front: r2 < 0,
        negative: r2 < 0 ? 1 : 0,
        height: height
      }
    ];

    if(data.extents) {
      this.extents = data.extents;
    } else {
      var forward = lens.Vec2(-1,0);
      var backward = forward.neg();
      if(data.height !== undefined) {
        var height = data.height;
        if(typeof height === 'number') {
          height = [height,height];
        }
        this.extents = [
          optic[0].circle.eval(r1 > 0 ? forward : backward, height[0], r1 < 0),
          optic[1].circle.eval(r2 < 0 ? forward : backward, height[1], r2 < 0)
        ];
      } else {
        var intersection = optic[0].circle.intersect(optic[1].circle);
        switch(intersection.type) {
        case 'concentric':
        case 'distinct':
          this.extents = [
            optic[0].circle.eval(r1 > 0 ? forward : backward, optic[0].circle.r, r1 < 0),
            optic[1].circle.eval(r2 < 0 ? forward : backward, optic[1].circle.r, r2 < 0),
          ];
          break;
        case 'intersect':
          this.extents = [ intersection.where, intersection.where ];
          this.extents[1] = [this.extents[1][1], this.extents[1][0]];
          break;
        }
      }
    }
  },
  prototype: {
    draw: function(paper) {
      var path_string = Raphael.fullfill(
        "M{extents.0.0} " +
        "A{optic.0.circle.r},{optic.0.circle.r} 0 0,{optic.0.negative} {extents.0.1}" +
        "L{extents.1.0} " +
        "A{optic.1.circle.r},{optic.1.circle.r} 0 0,{optic.1.negative} {extents.1.1}" +
        "Z"
      ,
        this
      );

      try {
        var path = paper.path(path_string);
        return path;
      } catch(ex) {
        console.log(path_string);
        debugger;
      }
    },
    build: function(surfaces) {
      surfaces.push(new lens.SphericalSurface(this.optic[0]));
      surfaces.push(new lens.SphericalSurface(this.optic[1]));
    }
  }
});

var Stop = lens.Stop = classify("Stop", {
  constructor: function(extents) {
    this.extents = extents;
  },
  prototype: {
    draw: function(paper) {
      var path_string = Raphael.fullfill(
        "M{extents.0} " +
        "L{extents.1} " +
        "Z"
      ,
        this
      );

      try {
        var path = paper.path(path_string);
        return path;
      } catch(ex) {
        console.log(path_string);
        debugger;
      }
    },
    build: function(surfaces) {
      surfaces.push(new lens.SphericalSurface(this.optic[0]));
      surfaces.push(new lens.SphericalSurface(this.optic[1]));
    }
  }
});