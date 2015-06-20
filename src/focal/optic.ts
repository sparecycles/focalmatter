import math = require('./math');
import material = require('./material');

module optic {
	export class Photon {
        constructor(public ray: math.Ray, public wavelength: number, public index = 1, public intensity = 1) {
        }
    }

    export interface Surface {
        trace(photon: Photon, tracer?: (photon: Photon) => void): Photon[];
    }

	export class SphericalSurface implements Surface {
        constructor(public info: SphericalSurface.Info) { }

        static refract(ray: math.Ray, circle: math.Circle, height: number, intersection_point: math.Point, out_p: boolean, index: number) {
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
                return null;
	        }

	        var refraction_direction = new math.Point(
	            -circle_direction.x,
	            -circle_direction.y
	        );

	        var angle = new math.Point(Math.sqrt(1 - refraction_sin * refraction_sin), refraction_sin);

	        refraction_direction = new math.Point(
	            angle.x * refraction_direction.x + angle.y * refraction_direction.y,
	           -angle.y * refraction_direction.x + angle.x * refraction_direction.y
	        );

	        return math.Ray.fromDirectionAndPoint(refraction_direction, P);
	    }

        trace(photon: Photon) {
            var intersect = this.info.circle.intersects(photon.ray);

            if (!intersect) {
                return null;
            }

            var index = this.info.material.index(photon.wavelength);
            var factor = photon.index / index;
            var ray = photon.ray;

            ray = SphericalSurface.refract(ray,
                this.info.circle,
                this.info.height,
                ray.at(intersect[this.info.front ? 0 : 1]),
                !this.info.front,
                factor);

            if (ray == null) {
                return null;
            }

            return [new Photon(ray, photon.wavelength, index, photon.intensity)];
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

    export class Stop implements Surface {
        constructor(extents: math.Point[]) {
            this.segment = math.Ray.fromTo(extents[0], extents[1]);
        }

        segment: math.Ray;

        trace(photon: Photon): Photon[] {
            var intercept = this.segment.intercept(photon.ray);

            if (intercept > 0 && intercept < 1) {
                return [photon];
            }

            return [];
        }
    }

    export class Optic implements Surface {
        constructor(public surfaces: Surface[]) {
        }

        trace(photon: Photon, tracer?: (photon: Photon) => void) {
            for (var index = 0; index < this.surfaces.length; index++) {
                var photons = this.surfaces[index].trace(photon, tracer);
                photon = photons && photons[0];
             
                if (!photon) {
                    break;
                }
                
                tracer && tracer(photon);
            }

            return photon && [photon];
        }
    }
}

export = optic;