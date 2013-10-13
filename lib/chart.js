var autoscale = require('autoscale-canvas');
var resize = require('resize');
var debounce = require ('debounce');
var Configurable = require('configurable.js');
var Emitter = require ('emitter');
var raf = require ('raf');
var style = require ('style');
var Tween = require ('tween');
var min = require ('min');
var max = require ('max');


var styles = window.getComputedStyle;

function Chart (dom) {
  this.parent = dom;
  this.styles = {
    color: style('.livechart .text', 'color'),
    fontSize: style('.livechart .text', 'font-size') || '10px',
    titleColor: style('.livechart .title', 'color'),
    titleSize: style('.livechart .title', 'font-size') || '14px',
    labelColor: style('.livechart .label', 'color')
  };
  var canvas = this.canvas  = document.createElement('canvas');
  resize.bind(dom, debounce(this.resize.bind(this)), 200);
  dom.appendChild(this.canvas);
  this.resize();
  this.settings = {};
  this.set('format', function (v) { return v; });
}

Configurable(Chart.prototype);
Emitter(Chart.prototype);

Chart.prototype.resize = function() {
  var dom = this.parent;
  var canvas = this.canvas;
  var width = parseInt(styles(dom).width, 10);
  var height = parseInt(styles(dom).height, 10);
  this.height = canvas.height = height;
  this.width = canvas.width = width;
  autoscale(canvas);
  var ctx = this.ctx = canvas.getContext('2d');
  this.emit('resize');
}

Chart.prototype.start = function() {
  var self = this;
  var delta = 0;
  var tween = Tween({d: 0})
    .ease(this.get('ease') || 'in-out-quad')
    .to({d: 1})
    .duration(this.get('duration') || 500);

  tween.update(function(o){
    delta = o.d;
    self.draw(delta);
  });

  tween.on('end', function(){
    self.emit('end');
    animate = function (){ }
  });

  function animate () {
    raf(animate);
    tween.update();
  }
  animate();
}

Chart.prototype.tween = function(from, to) {
  return function (delta) {
    for (var prop in from) {
      this[prop] = from[prop] + (to[prop] - from[prop]) * delta;
    }
  }
}

Chart.prototype.drawLabels = function() {
  var labels = this.get('labels');
  if (!labels) return;
  var ctx = this.ctx;
  var colors = this.get('colors');
  ctx.save();
  ctx.setTransform(window.devicePixelRatio || 1 ,0 ,0 ,window.devicePixelRatio || 1 ,0, 0);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '12px helvetica';
  labels.forEach(function(text, i) {
    var color = colors[i];
    ctx.fillStyle = color;
    drawRoundRect(ctx, 5, i * 18 + 5 , 18, 14 );
    ctx.fillStyle = this.styles.labelColor;
    ctx.fillText(text, 28, i* 18 + 5);
  }.bind(this));
  ctx.restore();
}

/**
 * Called by every chart before drawing
 * @api private
 */
Chart.prototype.draw = function() {
  var ctx = this.ctx;
  ctx.clearRect(-100, 0, this.width + 100, this.height);
  ctx.save();
  ctx.font = this.styles.fontSize + ' helvetica';
  ctx.translate(this.dims.x, this.dims.y);
}

Chart.prototype.toRgb = function(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

Chart.prototype.calcRectDimensions = function(chart) {
  var paddings = {
    t: getChartStyle(chart, 'paddingTop', true),
    b: getChartStyle(chart, 'paddingBottom', true),
    l: getChartStyle(chart, 'paddingLeft', true),
    r: getChartStyle(chart, 'paddingRight', true)
  }
  this.dims = {
    x: paddings.l,
    y: this.height - paddings.b,
    w: this.width - paddings.l - paddings.r,
    h: this.height - paddings.b - paddings.t
  }
}

Chart.prototype.calcCircleDimensions = function(chart) {
  var padding = getChartStyle(chart, 'paddingTop', true);
  var min = Math.min(this.height, this.width);
  var r = (min - padding*2)/2;
  this.dims = {
    x: (this.width - min)/2 + padding + r,
    y: (this.height - min)/2 + padding + r,
    r: r
  }
}

Chart.prototype.getRange = function(){
  var minValue = min(this.items, 'value');
  var maxValue = max(this.items, 'value');
  minValue = Math.min(minValue, this.get('min'));
  maxValue = Math.max(maxValue, this.get('max'));
  this.set('min', minValue);
  this.set('max', maxValue);
  return {
    min: minValue,
    max: maxValue
  }
}

function drawRoundRect (ctx, x, y , w, h) {
  var r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w ,y , x + w, y + r);
  ctx.lineTo(x + w , y + h - r);
  ctx.quadraticCurveTo(x + w , y + h, x + w - r, y + h);
  ctx.lineTo(x + r , y + h);
  ctx.quadraticCurveTo(x , y + h, x, y + h - r);
  ctx.lineTo(x , y + r);
  ctx.quadraticCurveTo(x , y , x + r, y);
  ctx.fill();
}

/**
 * 
 * @param {String} cn chart name
 * @param {String} sn style name
 * @param {Boolean} parse whether to parse int
 * @api public
 */
function getChartStyle (cn, sn, parse) {
  var v = style('.livechart .' + cn, sn);
  v = parse? parseInt(v, 10) : v;
  return v;
}

module.exports = Chart;
