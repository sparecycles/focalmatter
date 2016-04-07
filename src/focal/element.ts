
import math from './math';
import material from './material';
import {Surface, SphericalSurface, Stop} from './optic';

declare var Raphael;

var Material = material.Material;

namespace element {
    export interface Component {
        build(surfaces: Surface[]);
        draw(paper);
    }

    export class Group implements Component {
        constructor(public elements: Element[]) {
        }

        static balsam(components: Component[]): Component[] {
            var groups: Component[] = [];
            var group: Element[] = [];
            var lastElement: Element;

            function addToGroup(component: Component) {
                if (component instanceof Element && (group.length == 0 || lastElement &&
                    lastElement.back === (<Element>component).front
                    && lastElement.r2 === -(<Element>component).r1)) {
                    group.push(lastElement = <Element>component);
                } else {
                    lastElement = null;
                    if (group.length) {
                        groups.push(new Group(group));
                        group = [];
                    }

                    if (component instanceof Element) {
                        addToGroup(component);
                    } else {
                        groups.push(component);
                    }
                }
            }

            components.forEach((component) => {
                addToGroup(component);
            });

            if (group.length) {
                groups.push(new Group(group));
            }

            return groups;
        }

        build(surfaces: Surface[]) {
            for (var i = 0; i < this.elements.length; i++) {
                var element = this.elements[i];
                surfaces.push(new SphericalSurface(element.frontSurface()));
            }

            surfaces.push(new SphericalSurface(element.rearSurface()));
        }

        draw(paper) {
            this.elements.forEach((element) => element.draw(paper));
        }
    }

    export class Element implements Component {
        r1: number;
        r2: number;
        front: number;
        back: number;
        c1: number;
        c2: number;
        material: material.Material;
        height: number[];
        extents: any[];
        private surfaces: OpticalSurface[];

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
            this.material = info.material;

            this.surfaces = [this.frontSurface(), this.rearSurface()];

            if (info.extents) {
                this.extents = info.extents;
            } else {
                var forward = new math.Point(-1, 0);
                var backward = forward.neg();
                if (info.height != null) {
                    var height = info.height;
                    if (typeof height === 'number') {
                        height = [<number>height, <number>height];
                    }
                    this.height = <number[]>height;
                    this.extents = [
                        this.surfaces[0].circle.eval(r1 > 0 ? forward : backward, height[0], r1 < 0),
                        this.surfaces[1].circle.eval(r2 < 0 ? forward : backward, height[1], r2 < 0)
                    ];
                } else {
                    var intersection = this.surfaces[0].circle.intersect(this.surfaces[1].circle);
                    switch (intersection.type) {
                        case 'concentric':
                        case 'distinct':
                            this.extents = [
                                this.surfaces[0].circle.eval(r1 > 0 ? forward : backward, this.surfaces[0].circle.r, r1 < 0),
                                this.surfaces[1].circle.eval(r2 < 0 ? forward : backward, this.surfaces[1].circle.r, r2 < 0),
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

        frontSurface(): OpticalSurface {
            return {
                circle: new math.Circle(new math.Point(this.c1, 0), Math.abs(this.r1)),
                material: this.material || Material.Air,
                front: this.r1 > 0,
                negative: this.r1 < 0 ? 1 : 0,
                height: this.height && this.height[0]
            };
        }

        rearSurface(): OpticalSurface {
            return {
                circle: new math.Circle(new math.Point(this.c2, 0), Math.abs(this.r2)),
                material: Material.Air,
                front: this.r2 < 0,
                negative: this.r2 < 0 ? 1 : 0,
                height: this.height && this.height[1]
            };
        }

        build(surfaces: Surface[]) {
            surfaces.push(new SphericalSurface(this.frontSurface()));
            surfaces.push(new SphericalSurface(this.rearSurface()));
        }

        draw(paper) {
            var path_string = Raphael.fullfill(
                "M{extents.0.0} " +
                "A{surfaces.0.circle.r},{surfaces.0.circle.r} 0 0,{surfaces.0.negative} {extents.0.1}" +
                "L{extents.1.0} " +
                "A{surfaces.1.circle.r},{surfaces.1.circle.r} 0 0,{surfaces.1.negative} {extents.1.1}" +
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
    }

    export class Aperture implements Component {
        constructor(public extents: math.Point[]) {
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

        build(surfaces: Surface[]) {
            surfaces.push(new Stop(this.extents));
        }
    }


    export namespace Element {
        export interface Info {
            radius: number|number[];
            front: number;
            depth: number;
            height?: number|number[];
            material?: material.Material;
            extents?: number[];
        }

    }

    export interface OpticalSurface {
        circle: math.Circle;
        material: material.Material;
        front: boolean;
        negative: number;
        height: number;
    }
}

export default element;