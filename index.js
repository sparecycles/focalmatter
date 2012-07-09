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

var lens = require('lens.js');
var math = require('math.js');
var element = require('element.js');
var material = require('material.js');

var elements = [];

var x = new function() {
  var pos = 0;
  return function(arg) {
    if(arg) { pos += arg; return arg; }
    return pos;
  }
}();

if(1) {

var topogon = {
  ball: { outer: 10, inner: 14, depth: 4.5, material: material.Material.Glass.Schott('P-BK7') },
  shell: { outer: 8, inner: 6.75, depth: .5, height: 6, material: material.Material.Glass.Schott('F2') },
  spacing: 11,
  aperture: 3.5
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

elements.push(new element.Element({
  radius: 1000,
  index: 1,
  front: x(),
  depth: x(0.0001),
  height: topogon.aperture
}));

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

var optic = new lens.Optic(elements);

function makePaper(id) {
  var paper = new Raphael(id);
  paper.setViewBox(-10,-10,50,50);
  return paper;
}

var draw = {};

if(false) optic.lenses.forEach(function(lens) {
  var circle = draw.paper.circle(lens.circle.c.x, lens.circle.c.y, lens.circle.r);
  circle.attr("stroke", "none");
  circle.attr("opacity", ".5");
});


function trace(ray, color, optic) {
  return optic.refract()
}

function render(paper, direction, wavelength, step, offset) {
  step = step || 1;
  offset = offset || 0;
  offset *= step;
  for(var i = 5 + offset; i >= -5; i -= step) {
    var ray = lens.Ray.fromDirectionAndPoint(direction.unit(), lens.Vec2(-10, -i));
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
      stroke.attr('stroke', material.rgbFromWavelength(wavelength));
    }
  }
}

function shape(rays) {
  rays.map(function(ray) {

  });
  for(var i = 5 + offset; i >= -5; i -= step) {
    var ray = lens.Ray.fromDirectionAndPoint(direction.unit(), lens.Vec2(-10, -i));
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
      stroke.attr('stroke', material.rgbFromWavelength(wavelength));
    }
  }
}

function update(angle, dy) {
  draw.light.clear();
  [angle].forEach(function(angle) {
    render(draw.light, lens.Vec2(1,angle), 400, 1, dy);
    render(draw.light, lens.Vec2(1,angle), 500, 1, dy);
    render(draw.light, lens.Vec2(1,angle), 600, 1, dy);
  });
}

function drawOptic(elements) {
  elements.forEach(function(element) {
    var path = element.draw(draw.paper);
    path.attr("fill", '#999');
    path.attr("stroke", "blue");
    path.attr("stroke-width", ".5");
    path.attr("opacity", ".5");
  });
}

function onDocumentParsed() {
  var colors = document.createElement("div");
  document.body.appendChild(colors);

  for(var wv = 350; wv <= 800; wv += 10) {
    var div = document.createElement("div");
    div.style.display = "inline-block";
    div.style.background = material.rgbFromWavelength(wv);
    div.style.width = "5px";
    div.style.height = "30px";
    colors.appendChild(div);
  }

  draw.paper = makePaper("paper");
  draw.light = makePaper("light");

  drawOptic(elements);

  window.addEventListener("mousemove", function(event) {
    var y = (event.clientY - window.innerHeight/2) / window.innerHeight;
    update(y, 0);
  });

  update(0,0);
}
