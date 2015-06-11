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
                var type = Schott[name];
                if (type.sellmeier) {
                    return new Glass(light.indexForSellmeierDispersion(type.sellmeier));
                } else {
                    return new Glass(light.indexForStandardDispersion(type.abbe))
                }
            }
        }
    }

    export var Schott: {
        [glass_code: string]: {
            sellmeier: light.SellmeierInfo;
            abbe?: light.AbbeInfo;
        } | {
            abbe: light.AbbeInfo;
            sellmeier?: light.SellmeierInfo;
        };    
    } = {
        'N-FK5': {
            sellmeier: {
                B: [0.844309338, 0.344147824, 0.910790213],
                C: [0.00475111955, 0.0149814849, 97.8600293]
            },
            abbe: {
                nd: 1.48749,
                vd: 70.41
            }
        },
        'P-BK7': {
            sellmeier: {
                B: [1.03961212, 0.231792344, 1.01046945],
                C: [0.00600069867, 0.0200179144, 103.560653]
            }
        },
        'F2': {
            abbe: {
                nd: 1.62004,
                vd: 36.37
            }
        },
        'N-SK2': {
            abbe: {
                nd: 1.60738,
                vd: 56.65
            }
        },
        'N-SF11': {
            abbe: {
                nd: 1.78472,
                vd: 25.68
            }
        },
        'N-SF15': {
            abbe: {
                nd: 1.69892,
                vd: 30.20
            }
        },
        'N-SF57HTultra': {
            abbe: {
                nd: 1.84666,
                vd: 23.78
            }
        }
    };
}

export = material;
