/*
 * Color        Frequency       Wavelength
 * violet       668–789 THz     380–450 nm
 * blue         606–668 THz     450–495 nm
 * green        526–606 THz     495–570 nm
 * yellow       508–526 THz     570–590 nm
 * orange       484–508 THz     590–620 nm
 * red          400–484 THz     620–750 nm
 */

/*
 * violet      380–450 nm
 * blue        450–495 nm
 * green       495–570 nm
 * yellow      570–590 nm
 * orange      590–620 nm
 * red         620–750 nm
 * n_i  365     near UV
 * n_h  404     violet
 * n_g  435     violet-blue
 * n_F' 480     blue-green
 * n_F  486.1   blue-greener
 * n_e  546.1   green
 * n_d  587.6   yellow-green
 * n_D  589.3   orange
 * n_C' 643.8   red-orange
 * n_C 656.3    red
 * n_r 706.5    redder
 * n_s 852.1    near IR
 * n_t 1014.0   far IR
 */

import lens = require('focal/lens');
import math = require('focal/math');
import light = require('focal/light');
import element = require('focal/element');
import material = require('focal/material');

declare var Raphael;

var elements = [];
var optic: any;

var x = (function() {
  var pos = 0;
  return function(arg?) {
    if (arg) { pos += arg; return arg; }
    return pos;
  }
})();

if (1) {


x(1);

elements.push(new element.Element({
  radius: [ 15, 80 ],
  material: material.Material.Glass.Schott('F2'),
  front: x(),
  depth: x(1),
  height: 4
}));

x(1)

elements.push(new element.Stop([
  new math.Point(x(), -2),
  new math.Point(x(), 2),
]));

x(1);

elements.push(new element.Element({
  radius: [ -30, 5 ],
  material: material.Material.Glass.Schott('P-BK7'),
  front: x(),
  depth: x(1.5),
  height: 3
}));


elements.push(new element.Element({
  radius: [ -5, -10 ],
  material: material.Material.Glass.Schott('F2'),
  front: x(),
  depth: x(.6),
  height: 3
}));

x(2);

elements.push(new element.Element({
  radius: [ 20, 15 ],
  material: material.Material.Glass.Schott('N-SF11'),
  front: x(),
  depth: x(1),
  height: 3
}));

} else if (1) {

elements.push(new element.Element({
  radius: [ -25, 20 ],
  material: material.Material.Glass.Schott('F2'),
  front: x(),
  depth: x(1),
  height: 8
}));

x(7);

elements.push(new element.Stop([
  new math.Point(x(), -3),
  new math.Point(x(), 3)
]));

x(4);

elements.push(new element.Element({
  radius: [ -20, 10 ],
  material: material.Material.Glass.Schott('P-BK7'),
  front: x(),
  depth: x(1),
  height: 4,
}));


x(4)

  0 && 
elements.push(new element.Element({
  radius: [ 20, 1000 ],
  material: material.Material.Glass.Schott('F2'),
  front: x(),
  depth: x(1),
  height: 4
}));


} else if (1) {

var topogon = {
  ball: { outer: 10, inner: 14, depth: 4.5, material: material.Material.Glass.Schott('P-BK7') },
  shell: { outer: 8, inner: 6.75, depth: .5, height: 6, material: material.Material.Glass.Schott('F2') },
  spacing: 11,
  aperture: 5
};

elements.push(new element.Element({
  radius: [ topogon.ball.outer, -topogon.ball.inner ],
  material: topogon.ball.material,
  front: x(),
  depth: x(topogon.ball.depth)
}));

elements.push(new element.Element({
  radius: [ topogon.shell.outer, -topogon.shell.inner ],
  material: topogon.shell.material,
  front: x(),
  depth: x(topogon.shell.depth),
  height: topogon.shell.height
}));

x(topogon.spacing/2);

elements.push(new element.Stop([
  new math.Point(x(), -topogon.aperture/2),
  new math.Point(x(), +topogon.aperture / 2),
]));

x(topogon.spacing/2);

elements.push(new element.Element({
  radius: [-topogon.shell.inner, topogon.shell.outer ],
  material: topogon.shell.material,
  front: x(),
  depth: x(topogon.shell.depth),
  height: topogon.shell.height
}));

elements.push(new element.Element({
  radius: [-topogon.ball.inner, topogon.ball.outer ],
  material: topogon.ball.material,
  front: x(),
  depth: x(topogon.ball.depth)
}));

} else {

x(1.5);

elements.push(new element.Element({
  radius: [1000, 1000],
  index: 1,
  front: x(),
  depth: x(0.001),
  height: 2,
}));

x(1.5);

elements.push(new element.Element({
  radius: [30,30],
  material: material.Material.Glass.Schott('P-BK7'),
  front: x(),
  depth: x(2),
  height: 4,
}));

x(3);

elements.push(new element.Element({
  radius: [-40, -40],
  material: material.Material.Glass.Schott(true ? 'F2' : 'P-BK7'),
  front: x(),
  depth: x(1),
  height: 6,
}));

x(3);

elements.push(new element.Element({
  radius: [30, 30],
  material: material.Material.Glass.Schott('P-BK7'),
  front: x(),
  depth: x(2),
  height: 4,
}));

}

function makePaper(id) {
  var paper = new Raphael(id);
  paper.setViewBox(-10,-20,40,70,false);
  return paper;
}

var draw: any = {};

if (false) optic.lenses.forEach(function(lens) {
  var circle = draw.paper.circle(lens.circle.c.x, lens.circle.c.y, lens.circle.r);
  circle.attr("stroke", "none");
  circle.attr("opacity", ".5");
});


function render(paper, direction, wavelength, step, offset) {
  step = step || 1;
  offset = offset || 0;
  offset *= step;
  for(var i = 20 + offset; i >= -20; i -= step) {
      var ray = math.Ray.fromDirectionAndPoint(direction.unit(), new math.Point(-10, -i));
    var result = optic.refract(ray, wavelength);
    if(result) {
      var last = result[result.length-1];
      var stroke = paper.path(Raphael.fullfill(
        "M{ray.origin}" + 
        result.map(function(ray) {
          return Raphael.fullfill("L{origin}", ray);
        }).join("") +
        "L{next}",
      {
        ray: ray,
        next: last.at(100)
      }));
      stroke.attr('stroke-width', '.4');
      stroke.attr('stroke', light.rgbFromWavelength(wavelength));
    }
  }
}

function drawLight(angle, dy) {
  draw.light.clear();
  [angle].forEach(function(angle) {
    render(draw.light, new math.Point(1,angle), 400, 1, 0.00);
    render(draw.light, new math.Point(1,angle), 500, 1, 0.33);
    render(draw.light, new math.Point(1,angle), 600, 1, 0.66);
  });
}

var drawTasks: any = null;

function postRedraw() {
  if (!drawTasks) {
    drawTasks = {};

    requestAnimationFrame(function() {
      doRedraw(drawTasks);
      drawTasks = null;
    });
  }

  return drawTasks;
}

var scene: any = {};

function redrawOptic(elements) {
  postRedraw().optic = true;
  scene.elements = elements;
}

function computeFocalPlane(elements) {
  
}

function redrawLight(angle, dy) {
  postRedraw().light = true;
  scene.light = { angle: angle, dy: dy };
}

function doRedraw(tasks) {
  if (tasks.optic) {
    optic = new lens.Optic(elements);
    drawOptic(scene.elements);
    var focalPlane = computeFocalPlane(elements);
    //drawFocalPlane(focalPlane);
    tasks.light = true;
  }
  if(tasks.light) {
    drawLight(scene.light.angle, scene.light.dy);
  }
}

function drawOptic(elements) {
  draw.paper.clear();
  elements.forEach(function(element) {
    var path = element.draw(draw.paper);
  });
}

function onDocumentParsed() {
  var colors = document.createElement("div");
  document.body.appendChild(colors);

  for(var wv = 350; wv <= 800; wv += 10) {
    var div = document.createElement("div");
    div.style.display = "inline-block";
    div.style.background = light.rgbFromWavelength(wv);
    div.style.width = "5px";
    div.style.height = "30px";
    colors.appendChild(div);
  }

  draw.paper = makePaper("paper");
  draw.light = makePaper("light");

  redrawOptic(elements);

  var KEY_LEFT  = 37;
  var KEY_UP    = 38;
  var KEY_RIGHT = 39;
  var KEY_DOWN  = 40;

  window.addEventListener("keydown", function(event) {
    switch(event.keyCode) {
    case KEY_LEFT:
      elements[1] = new element.Element({
        radius: [ topogon.ball.outer, -topogon.ball.inner ],
        material: topogon.ball.material,
        front: 5,
        depth: topogon.ball.depth
      });
      redrawOptic(elements);
      break;
    case KEY_RIGHT:
      break;
    case KEY_DOWN:
      break;
    case KEY_UP:
      break;
    }
  });

  window.addEventListener("mousemove", function(event) {
    var y = (event.clientY - window.innerHeight/2) / window.innerHeight;
    redrawLight(y, 0);
  });

  redrawLight(0,0);
}

if (document.readyState === "complete") onDocumentParsed();
else 
window.addEventListener("DOMContentLoaded", onDocumentParsed);
