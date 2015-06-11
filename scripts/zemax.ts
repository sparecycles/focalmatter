/// <reference path='../typescript/node.d.ts' />

import fs = require('fs');

module ZEMAX {
    interface Glass {
        GC?: string; // Remarks
        ED?: number[]; // Extra Data (?)
        CD?: number[]; // Constants of Dispersion
        TD?: number[]; // Temperture Dispersion
        OD?: number[]; // Other Data: ?? CR FR SR AR PR
        LD?: number[];
        IT?: number[][]; // Internal Transmitance
    }

    interface AGFInfo {
        CC?: string;
        data: {
            [NM: string]: Glass;
        }
    }

    function parseZEMAX_agf(lines: string[]) {
        var glass: Glass;
        var result: AGFInfo = { data: {} };

        function numbers(info: string) {
            return info.replace(/-\s+/g, '-').split(/\s+/).map(Number);
        }

        lines.forEach((line) => {
            var info = line.slice(2).trim();
            switch (line.slice(0, 2)) {
                case 'CC':
                    result.CC = result.CC ? result.CC + "\n" + info : info;
                    break;
                case 'NM':
                    var parts = info.split(/\s+/);
                    glass = result.data[parts[0]] = {};
                    break;
                case 'GC':
                    glass.GC = info;
                    break;
                case 'ED':
                    glass.ED = numbers(info);
                    break;
                case 'CD':
                    glass.CD = numbers(info);
                    break;
                case 'TD':
                    glass.TD = numbers(info);
                    break;
                case 'OD':
                    glass.OD = numbers(info);
                    break;
                case 'LD':
                    glass.LD = numbers(info);
                    break;
                case 'IT':
                    if (null == glass.IT) glass.IT = [];
                    glass.IT.push(numbers(info));
                    break;
            }
        });

        return result;
    }

    function read(filename: string, cb: (err: any, text?: string) => void) {
        if (filename === '-' || filename == null) {
            var text = '';
            process.stdin.on('data', (data) => text += data);
            process.stdin.on('end', () => cb(null, text));
            process.stdin.on('error', (err) => cb(err));
        } else {
            fs.readFile(filename, (err, buffer) => cb(err, buffer && buffer.toString()));
        }
    }

    function write(filename: string, text: string) {
        if (filename === '-' || filename == null) {
           process.stdout.write(text);
        } else {
           fs.writeFileSync(filename, text);
        }
    }

    export function writeGlasses(filename: string, output: string) {
        var text = read(filename, (err, text: string) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }

            var agf = parseZEMAX_agf(text.split(/[\n\r]+/));

            var glasses: any = {};
            for(var name in agf.data) {
                var input = agf.data[name];
                glasses[name] = {
                    sellmeier: {
                        B: [input.CD[0] || 0, input.CD[2] || 0, input.CD[4] || 0],
                        C: [input.CD[1] || 0, input.CD[3] || 0, input.CD[5] || 0]
                    }
                };
            }

            write(output, JSON.stringify(glasses, null, 2));
        });
    }
}

ZEMAX.writeGlasses(process.argv[2], process.argv[3] || '-');
