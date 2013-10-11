var autoscale = require('autoscale-canvas');
var resize = require('resize');
var debounce = require ('debounce');
var Configurable = require('configurable.js');
var Emitter = require ('emitter');
var raf = require ('raf');
var style = require ('style');
var Tween = require ('tween');


var styles = window.getComputedStyle;

function Chart (dom) {
  this.parent = dom;
  var canvas = this.canvas  = document.createElement('canvas');
  resize.bind(dom, debounce(this.resize.bind(this)), 200);
  dom.appendChild(this.canvas);
  this.resize();
  this.settings = {};
  this.styles = {};
  this.styles.color = style('.livechart .text', 'color');
  this.styles.fontSize = style('.livechart .text', 'font-size') || '10px';
  this.styles.titleColor = style('.livechart .title', 'color');
  this.styles.titleSize = style('.livechart .title', 'font-size') || '14px';
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
  //origin at left bottom
  ctx.translate(0, this.height);
}

//should be implemented by subclass
Chart.prototype.draw = function(delta) {
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
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var h = parseInt(this.styles.fontSize, 10) + 10;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '24px helvetica';
  labels.forEach(function(text, i) {
    var color = colors[i];
    ctx.fillStyle = color;
    drawRoundRect(ctx, 5, i * (h + 10) + 5 , 25, h );
    ctx.fillStyle = this.styles.color;
    ctx.fillText(text, 40, i*(h+10) + h/2 + 5);
  }.bind(this));
  ctx.restore();
}

Chart.prototype.toRgb = function(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
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

module.exports = Chart;
