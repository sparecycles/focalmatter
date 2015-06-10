module light {
    export var StandardWavelengths = {
        d: 587.6,
        F: 486.1,
        C: 656.3,
        i: 365.0,
        t: 1014.0,
    };

    var colors: { [wavelength: number]: number[] } = {};

    export function colorFromWavelength(wavelength) {
        var computed = colors[wavelength];
        
        if (computed) {
            return computed;
        }

        // these numbers were determined experimentally to look nice.
        var blue = [[425, 540, 1, 1]];
        var green = [[530, 740, 1 / 1.3, 1]];
        var red = [[630, 800, 1 / 2, 1], [380, 420, 1, .3]];

        function factor(datas) {
            var sum = 0;

            datas.forEach((data) => {
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

        return colors[wavelength] = rgb.map(function(factor) {
            return Math.min(Math.max(Math.min(factor, 1), 0) * 256 | 0, 255);
        });
    }


    export function rgbFromWavelength(wavelength) {
        return "rgb(" + colorFromWavelength(wavelength).join(',') + ")";
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
}


export = light;