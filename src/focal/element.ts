
import math = require('./math');
import material = require('./material');

declare var Raphael;

var Material = material.Material;

module element {
    export class Photon {
        constructor(public ray: math.Ray, public wavelength: number, public index = 1) {
        }
    }

    function refract(ray: math.Ray, circle: math.Circle, height: number, intersection_point: math.Point, out_p: boolean, index: number) {
        var R = ray;
        var P = intersection_point;

        if (Math.abs(P.y) > height) {
            return null;
        }

        var ray_direction = R.direction();
        var circle_direction = P.sub(circle.c).unit();

        if (out_p) {
            circle_direction = circle_direction.neg();
        }

        var incidence_sin = ray_direction.x * circle_direction.y - ray_direction.y * circle_direction.x;
        var refraction_sin = -incidence_sin * index;

        if (Math.abs(refraction_sin) > 1) {
            throw new Error('refraction');
        }

        var refraction_direction = new math.Point(
            -circle_direction.x,
            -circle_direction.y
            );

        var angle = new math.Point(Math.sqrt(1 - refraction_sin * refraction_sin), refraction_sin);

        refraction_direction = new math.Point(
            angle.x * refraction_direction.x + angle.y * refraction_direction.y,
            - angle.y * refraction_direction.x + angle.x * refraction_direction.y
            );

        return math.Ray.fromDirectionAndPoint(refraction_direction, P);
    }

    function refract_spherical(ray: math.Ray, circle: math.Circle, height: number, intersection_point: math.Point, out_p: boolean, index: number) {
        var R = ray;
        var P = intersection_point;

        if (Math.abs(P.y) > height) {
            return null;
        }

        var ray_direction = R.direction();
        var circle_direction = P.sub(circle.c).unit();

        if (out_p) {
            circle_direction = circle_direction.neg();
        }

        var incidence_sin = ray_direction.x * circle_direction.y - ray_direction.y * circle_direction.x;
        var refraction_sin = -incidence_sin * index;

        if (Math.abs(refraction_sin) > 1) {
            throw new Error('refraction');
        }

        var refraction_direction = new math.Point(
            -circle_direction.x,
            -circle_direction.y
            );

        var angle = new math.Point(Math.sqrt(1 - refraction_sin * refraction_sin), refraction_sin);

        refraction_direction = new math.Point(
            angle.x * refraction_direction.x + angle.y * refraction_direction.y,
            - angle.y * refraction_direction.x + angle.x * refraction_direction.y
            );

        return math.Ray.fromDirectionAndPoint(refraction_direction, P);
    }
    export class SphericalSurface {
        constructor(public info: SphericalSurface.Info) {
        }

        trace(photon: Photon) {
            var intersect = this.info.circle.intersects(photon.ray);

            if (!intersect) {
                return null;
            }

            var index = this.info.material.index(photon.wavelength);
            var factor = photon.index / index;
            var ray = photon.ray;

            ray = refract_spherical(ray,
                this.info.circle,
                this.info.height,
                ray.at(intersect[this.info.front ? 0 : 1]),
                !this.info.front,
                factor);

            if (ray == null) {
                return null;
            }

            return new Photon(ray, photon.wavelength, index);
        }
    }

    export module SphericalSurface {
        export interface Info {
            circle: math.Circle;
            height: number;
            front: boolean;
            material: material.Material;
        }
    }

    export class Element {
        r1: number;
        r2: number;
        front: number;
        back: number;
        c1: number;
        c2: number;
        optic: any[];
        extents: any[];

        constructor(info: Element.Info) {
            var radius = info.radius;
            if (typeof radius === 'number') {
                radius = [<number>radius, <number>radius];
            }
            var r1 = this.r1 = radius[0];
            var r2 = this.r2 = radius[1];
            var front = this.front = info.front;
            var back = this.back = front + info.depth;
            var c1 = this.c1 = front + r1;
            var c2 = this.c2 = back - r2;
            var height = info.height;
            var optic = this.optic = [
                {
                    circle: new math.Circle(new math.Point(c1, 0), Math.abs(r1)),
                    material: info.material || Material.Air,
                    front: r1 > 0,
                    negative: r1 < 0 ? 1 : 0,
                    height: height
                },
                {
                    circle: new math.Circle(new math.Point(c2, 0), Math.abs(r2)),
                    material: Material.Air,
                    front: r2 < 0,
                    negative: r2 < 0 ? 1 : 0,
                    height: height
                }
            ];

            if (info.extents) {
                this.extents = info.extents;
            } else {
                var forward = new math.Point(-1, 0);
                var backward = forward.neg();
                if (info.height !== undefined) {
                    var height = info.height;
                    if (typeof height === 'number') {
                        height = [<number>height, <number>height];
                    }
                    this.extents = [
                        optic[0].circle.eval(r1 > 0 ? forward : backward, height[0], r1 < 0),
                        optic[1].circle.eval(r2 < 0 ? forward : backward, height[1], r2 < 0)
                    ];
                } else {
                    var intersection = optic[0].circle.intersect(optic[1].circle);
                    switch (intersection.type) {
                        case 'concentric':
                        case 'distinct':
                            this.extents = [
                                optic[0].circle.eval(r1 > 0 ? forward : backward, optic[0].circle.r, r1 < 0),
                                optic[1].circle.eval(r2 < 0 ? forward : backward, optic[1].circle.r, r2 < 0),
                            ];
                            break;
                        case 'intersect':
                            this.extents = [intersection.where, intersection.where];
                            this.extents[1] = [this.extents[1][1], this.extents[1][0]];
                            break;
                    }
                }
            }
        }

        draw(paper) {
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

                path.attr("fill", '#999');
                path.attr("stroke", "blue");
                path.attr("stroke-width", ".5");
                path.attr("opacity", ".5");

                return path;
            } catch (ex) {
                console.log(path_string);
                debugger;
            }
        }
        
        build(surfaces) {
            surfaces.push(new SphericalSurface(this.optic[0]));
            surfaces.push(new SphericalSurface(this.optic[1]));
        }
    }

    export module Element {
        export interface Info {
            radius: number|number[];
            front: number;
            depth: number;
            height?: number|number[];
            material?: material.Material;
            extents?: number[];
        }
    }

    export class OpticalStop {
        constructor(extents: math.Point[]) {
            this.segment = math.Ray.fromTo(extents[0], extents[1]);
        }

        segment: math.Ray;

        trace(photon: element.Photon) {
            var intercept = this.segment.intercept(photon.ray);
            if (intercept > 0 && intercept < 1) {
                return photon;
            }

            return null;
        }
    }

    export class Stop {
        constructor(public extents) {
            this.extents = extents;
        }

        draw(paper) {
            var path_string = Raphael.fullfill(
                "M{extents.0} " +
                "L{extents.1} " +
                "Z"
                , this);    

            try {
                var path = paper.path(path_string);
                path.attr('stroke-width', '1');
                return path;
            } catch (ex) {
                console.log(path_string);
                debugger;
            }
        }

        build(surfaces) {
            surfaces.push(new OpticalStop(this.extents));
        }
    }
}

export = element;