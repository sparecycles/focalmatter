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

import math = require('focal/math');
import light = require('focal/light');
import element = require('focal/element');
import material = require('focal/material');
import optic = require('focal/optic');

declare var Raphael;

var elements: element.Component[] = [];
var opticalSystem: optic.Optic;

function makePaper(id) {
  var paper = new Raphael(id);
  paper.setViewBox(-10,-20,40,70,false);
  return paper;
}

var draw: any = {};

function render(paper, direction, wavelength, step, offset) {
    step = step || 1;
    offset = offset || 0;
    offset *= step;
    for (var i = 20 + offset; i >= -20; i -= step) {
        var ray = math.Ray.fromDirectionAndPoint(direction.unit(), new math.Point(-10, -i));
        var result: optic.Photon[] = [];
        var complete = opticalSystem.trace(new optic.Photon(ray, wavelength), (photon) => {
          result.push(photon);
        });

        if (complete && result.length) {
            var last = result[result.length - 1];
            var stroke = paper.path(Raphael.fullfill(
                "M{ray.origin}" +
                result.map(function(photon) {
                    return Raphael.fullfill("L{origin}", photon.ray);
                }).join("") +
                "L{next}",
                {
                    ray: ray,
                    next: last.ray.at(100)
                }));
            stroke.attr('stroke-width', '.4');
            stroke.attr('stroke', light.rgbFromWavelength(wavelength));
        }
    }
}

function drawLight(angle, dy) {
    draw.light.clear();
    [angle].forEach(function(angle) {
        render(draw.light, new math.Point(1, angle), 400, 1, 0.0);
        render(draw.light, new math.Point(1, angle), 500, 1, 0.0);
        render(draw.light, new math.Point(1, angle), 600, 1, 0.0);
    });
}

var drawTasks: { optic?: boolean; light?: boolean; } = null;

function postRedraw() {
  if (!drawTasks) {
    drawTasks = {};

    requestAnimationFrame(function() {
      var tasks = drawTasks;
      drawTasks = null;      
      doRedraw(tasks);
    });
  }

  return drawTasks;
}

var scene: {
  components?: element.Component[];
  groups?: element.Component[];
  light?: { angle: number; dy: number; };
} = {};

function redrawOptic(components: element.Component[]) {
  postRedraw().optic = true;
  scene.components = components;
}

function computeFocalPlane(elements) {
  
}

function redrawLight(angle, dy) {
  postRedraw().light = true;
  scene.light = { angle: angle, dy: dy };
}

function doRedraw(tasks) {
  if (tasks.optic) {
    scene.groups = element.Group.balsam(scene.components);
    var surfaces = [];
    scene.groups.forEach((group) => group.build(surfaces));
    opticalSystem = new optic.Optic(surfaces);
    drawOptic(scene.groups);

    tasks.light = true;
  }
  if (tasks.light && opticalSystem) {
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

  window.addEventListener("mousemove", function(event) {
    var y = (event.clientY - window.innerHeight/2) / window.innerHeight;
    redrawLight(y, 0);
  });

  document.getElementById('lens').addEventListener('change', update);
  update.call(document.getElementById('lens'));

  console.log("onDocumentParsed");
}

function parse(text: string) {
  var components: element.Component[] = [];

  var x = 0;
  var unparsed = text.replace(/\s*\(([^\)]*)\)\s*/g, (match, command) => {
    var words = command.split(/\s+/);
    var depth = Number(words[1]);

    switch (words[0]) {
      case 'element':
        var info = {
          radius: [Number(words[2]), Number(words[3])],
          front: x,
          depth: depth,
          material: material.Material.Glass.Schott(words[4]),
          height: words[5] ? Number(words[5]) : null
        };

        components.push(new element.Element(info));
        break;
      case 'air':
        break;
      case 'stop':
        var height = Number(words[2]);
        components.push(new element.Stop([
          new math.Point(x, -height),
          new math.Point(x, +height)
        ]));
        break;
    }

    if (depth) {
      x += depth;
    }

    return "";
  });


  if (unparsed) throw unparsed;

  return components;
}

console.log("dom load blah")
switch(document.readyState) {
  case 'loading':
    window.addEventListener("DOMContentLoaded", onDocumentParsed);
    break;
  case 'interactive':
  case 'complete':
  default:
    onDocumentParsed();
    break;
}

function update() {
  var textarea = <HTMLTextAreaElement>this;
  var text = textarea.value;

  try {
    scene.components = parse(text);
    postRedraw().optic = true;
  } catch (ex) {
    // ...
  }
}