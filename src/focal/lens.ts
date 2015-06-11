import math = require('./math');
import element = require('./element');

module lens {

    export interface Surface {
        trace(photon: element.Photon): element.Photon;
    }


    export class Optic {
        constructor(elements: element.Element[]) {
            var surfaces: Surface[] = [];

            elements.forEach((element) => { element.build(surfaces); });

            this.surfaces = surfaces;
        }

        surfaces: Surface[];

        refract(ray: math.Ray, wavelength: number) {
            var photon = new element.Photon(ray, wavelength, 1);

            try {
                var photons = [photon];
                for (var sindex = 0; sindex < this.surfaces.length; sindex++) {
                    var surface = this.surfaces[sindex];
                    var refacted = surface.trace(photon);
                    if (refacted) {
                        photons.push(refacted);
                        photon = refacted;
                    } else return;
                }
                return photons.map(function(photon) { return photon.ray; });
            } catch (ex) {
                if (ex.message !== 'refraction') { console.error(ex); throw ex; }
            }
        }
    }
}

export = lens;
