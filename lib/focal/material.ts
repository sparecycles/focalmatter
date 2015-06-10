
module material {

    export var StandardWavelengths = {
        d: 587.6,
        F: 486.1,
        C: 656.3,
        i: 365.0,
        t: 1014.0,
    };

    export function colorFromWavelength(wavelength) {
        var blue = [[425, 540, 1, 1]];
        var green = [[530, 740, 1 / 1.3, 1]];
        var red = [[660, 800, 1 / 2, 1], [380, 420, 1, .3]];

        function factor(datas) {
            var sum = 0;
            datas.forEach(function(data) {
                var x = (wavelength - data[0]) / (data[1] - data[0]);
                sum += Math.pow(Math.exp(-Math.PI * x * x), data[2]) * data[3];
            });

            return sum;
        }

        var rgb = [factor(red), factor(green), factor(blue)];
        var max = Math.max(rgb[0], rgb[1], rgb[2]);

        if (max > 1) {
            rgb[0] /= max;
            rgb[1] /= max;
            rgb[2] /= max;
        }

        return rgb.map(function(factor) {
            return Math.min(Math.max(Math.min(factor, 1), 0) * 256 | 0, 255);
        });
    }

    export function rgbFromWavelength(wavelength) {
        return "rgb(" + material.colorFromWavelength(wavelength).join(',') + ")";
    }

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

    function DeAbbe(n_d: number, v_d: number) {
        var A = (n_d - 1) / v_d / (1 / StandardWavelengths.F - 1 / StandardWavelengths.C);
        var B = n_d - A / StandardWavelengths.d;
        return function(u: number) {
            return A / u + B;
        }
    }

    export function indexForStandardDispersion(data: { nd: number; vd?: number; nC?: number; nF?: number; }) {
        var nd = data.nd, vd: number;

        nd = data.nd;

        if (data.vd != null) {
            vd = data.vd;
        } else if (data.nF != null && data.nC != null) {
            vd = (data.nd - 1) / (data.nF - data.nC)
        }

        return DeAbbe(nd, vd);
    }

    export module Material {
        export class Glass extends Material {
            constructor(indexfn) {
                super(indexfn);
            }

            static fromGlassCode(code: string) {
                var nd = parseInt(code.substr(0, 3), 10) / 100 + 1.0;
                var vd = parseInt(code.substr(3, 3), 10) / 10;
                return new Glass(indexForStandardDispersion({
                    nd: nd,
                    vd: vd
                }));
            }

            static Schott(name: string) {
                var schottType = Schott[name];
                return new Glass(indexForStandardDispersion({
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
