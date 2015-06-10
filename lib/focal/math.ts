
module math {
  export function sgn(x) {
    return x > 0 ? +1 : x < 0 ? -1 : 0;
  }

  export function abs(x) {
    return x >= 0 ? x : -x;
  }

  export class Vec2 {
    constructor(public x: number, public y: number) {
    }

    static interpolate(p1: Vec2, p2: Vec2, t: number) {
      return new Vec2(p2.x * t + p1.x * (1 - t), p2.y * t + p1.y * (1 - t));
    }

    static zero = new Vec2(0, 0);
    static up = new Vec2(0, -1);
    static down = new Vec2(0, +1);
    static left = new Vec2(-1, 0);
    static right = new Vec2(+1, 0);

    unit() {
      var mag = this.mag();
      return mag == 0 ? this : this.mul(1 / mag);
    }
    add(o: Vec2) {
      var P = this;
      return new Vec2(P.x + o.x, P.y + o.y);
    }
    neg() {
      return new Vec2(-this.x, -this.y);
    }
    sub(o: Vec2) {
      return new Vec2(this.x - o.x, this.y - o.y);
    }
    to(o: Vec2) {
      return o.sub(this).unit();
    }
    mul(s: number) {
      return new Vec2(this.x * s, this.y * s);
    }
    mag() {
      return Math.sqrt(this.mag2());
    }
    mag2() {
      return this.x * this.x + this.y * this.y;
    }
    dist(o: Vec2) {
      return o.sub(this).mag();
    }
    dist2(o: Vec2) {
      return o.sub(this).mag2();
    }

    toString() {
      var P = this;
      return this.x + "," + this.y;
    }
  }

  export class Ray {
    U: number;
    V: number;
    S: number;
    t0: number;
    scale: number;
    origin: Vec2;

    constructor(U: number, V: number, S: number, options?: Ray.Options) {
      options = options || {};

      var scale = Math.sqrt(U * U + V * V);
      U /= scale;
      V /= scale;
      S /= scale;
      this.scale = scale;

      this.U = U;
      this.V = V;
      this.S = S;
      this.t0 = 0;
      if (options.origin) {
        this.origin = options.origin;
        this.t0 = this.project_t(options.origin);
      }
    }
    static fromTo(a: Vec2, b: Vec2) {
      return Ray.fromDirectionAndPoint(b.sub(a), a);
    }
    static fromDirectionAndPoint(dir: Vec2, point: Vec2) {
      var D = dir;
      var P = point;
      return new Ray(D.y, -D.x, P.x * D.y + P.y * -D.x, { origin: P });
    }
    toString() {
      return "(" + this.at(0) + "-->" + this.direction() + ")";
    }
    value(point: Vec2) {
      var P = point;
      var R = this;
      return P.x * R.U + P.y * R.V - R.S;
    }
    at(t: number) {
      var R = this;
      t += this.t0;
      return new Vec2(R.U * R.S - R.V * t, R.V * R.S + R.U * t);
    }
    direction() {
      var R = this;
      return new Vec2(-R.V, R.U);
    }
    project(point: Vec2) {
      return this.at(this.project_t(point));
    }
    project_t(point: Vec2) {
      var P = point;
      var R = this;
      return -R.V * P.x + R.U * P.y - R.t0;
    }
    transform(t, r) {
      var R = this;
      return R.at(t).add(new Vec2(R.U * r, R.V * r));
    }
    intercept(ray: Ray) {
      var R = this;

      var t = ((R.U * ray.U + R.V * ray.V) * R.S - ray.S) / (R.V * ray.U - R.U * ray.V) - this.t0;
      return t / this.scale;
    }
  }

  export module Ray {
    export interface Options {
      origin?: Vec2;
    }
  }

  export class Shape {
    constructor(public type: string) {}
  }

  export class Circle extends Shape {
    static type = "circle";
    constructor(public c: Vec2, public r: number) {
      super(Circle.type);
    }
    intersect(shape: Shape) {
      var isect = this['intersect$' + shape.type];
      if (isect) {
        return isect.call(this, shape);
      } else {
        throw new Error("Circle: intersect$" + shape.type + " not defined");
      }
    }
    private intersect$circle(circle: Circle) {
      var result: any = {};
      var C1 = this;
      var C2 = circle;
      var distance2 = C1.c.dist2(C2.c);
      var d_radii = C1.r - C2.r;
      if (distance2 < d_radii * d_radii) {
        result.type = 'concentric';
        return result;
      }

      var radii = C1.r + C2.r;
      if (distance2 > radii * radii) {
        result.type = 'distinct';
        return result;
      }

      result.type = 'intersect';

      var r1_2 = C1.r * C1.r;
      var r2_2 = C2.r * C2.r;
      var space = result.space = Ray.fromDirectionAndPoint(Vec2.right, C1.c);
      var dc = space.project_t(C2.c);
      var m_x = (r1_2 - r2_2 + dc * dc) / (2 * dc);
      var root = r1_2 - m_x * m_x;
      if (root > 0) {
        var height = Math.sqrt(root);
        result.middle = m_x;
        result.where = [space.transform(m_x, height), space.transform(m_x, -height)];
      } else {
        var where = space.at(C1.r);
        result.where = [space.transform(m_x, 0), space.transform(m_x, -0)];
      }
      return result;
    }

    eval(direction: Vec2, height: number, flip: boolean) {
      var C = this;
      var sin = height / C.r;
      var cos = sin >= 1 ? 0 : Math.sqrt(1 - sin * sin);
      var center = C.c.add(direction.mul(cos * C.r));
      var d = direction.mul(height);
      var h = new Vec2(-d.y, d.x);
      if (flip) h = h.neg();
      return [center.add(h), center.sub(h)];
    }

    intersects(ray: Ray) {
      var R = ray;
      var C = this;

      var e = R.value(C.c);
      if (C.r >= Math.abs(e)) {
        var t = R.project_t(C.c);
        var dt = Math.sqrt(C.r * C.r - e * e);
        return [t - dt, t + dt];
      }
    }
  }
}

export = math;
