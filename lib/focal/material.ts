import light = require('./light');

module material {

    export class Material {
        constructor();
        constructor(index: number);
        constructor(index: (wavelength: number) => number);
        constructor(index?: any) {
            if (typeof index === 'function') {
                this.index = index;
            } else if (index != null) {
                this.index = function(wavelength) { return index; };
            }
        }

        index(wavelength: number) {
            return 1;
        }

        static Air = new Material();
    }
    
    export module Material {
        export class Glass extends Material {
            constructor(indexfn) {
                super(indexfn);
            }

            static fromGlassCode(code: string) {
                var nd = parseInt(code.substr(0, 3), 10) / 100 + 1.0;
                var vd = parseInt(code.substr(3, 3), 10) / 10;
                return new Glass(light.indexForStandardDispersion({
                    nd: nd,
                    vd: vd
                }));
            }

            static Schott(name: string) {
                var schottType = Schott[name];
                return new Glass(light.indexForStandardDispersion({
                    vd: schottType.vd,
                    nd: schottType.nd
                }));
            }
        }
    }

    export var Schott = {
        'P-BK7': {
            nd: 1.516,
            vd: 64.06
        },
        'F2': {
            nd: 1.62004,
            vd: 36.37
        },
        'N-SK2': {
            nd: 1.60738,
            vd: 56.65
        },
        'N-SF11': {
            nd: 1.78472,
            vd: 25.68
        },
        'N-SF15': {
            nd: 1.69892,
            vd: 30.20
        },
        'N-SF57HTultra': {
            nd: 1.84666,
            vd: 23.78
        }
    };
}

export = material;
