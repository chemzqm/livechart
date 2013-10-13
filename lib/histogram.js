var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

function Histogram(parent){
  this.on('resize', function() {
    this.calcRectDimensions('histogram');
  }.bind(this))
  Chart.call(this, parent);
  this.set('count', 50);
  this.set('max', 100);
  this.set('min', 0);
  this.set('colors', ['#69D2E7']);
  this.items = [];
  this.labels = [];
}

inherit(Histogram, Chart);


Histogram.prototype.add = function(v){
  var bars = this.items;
  var bar = { value: v };
  var count = this.get('count');
  bars.push(bar)
  if (bars.length > count) {
    bars.shift();
  }
  var r = this.getRange();
  var space = this.getSpace();
  bars.forEach(function(bar, i) {
    var ty = 0 - this.dims.h * (bar.value - r.min)/(r.max - r.min);
    var tx= (i + count - bars.length) * space;
    if (!bar.x) {
      bar.x = tx;
      bar.y = ty;
      bar.onFrame = function() { }
    } else {
      bar.onFrame = this.tween({ x: bar.x, y: bar.y }, { x: tx, y: ty });
    }
  }.bind(this));
  var ctx = this.ctx;
  ctx.font = this.styles.fontSize + ' helvetica';
  var dw = ctx.measureText('00:00:00').width + 5;
  var first = this.labels[0];
  var last = this.labels[this.labels.length - 1];
  var tw = this.dims.w - space * 1/4;
  if(first && first.x < space) this.labels.shift();
  this.labels.forEach(function(label) {
    var x = label.x || 0;
    label.c = (typeof label.c === 'undefined')? 1 : label.c + 1;
    var tx = this.dims.w - space/4 - label.c * space;
    label.onFrame = this.tween({x: x}, {x: tx});
  }.bind(this));
  if (this.labels.length === 0 || (last && (tw - last.x >= dw))) {
    var s = currentTime();
    this.labels.push({
      text: s ,
      x: tw,
      onFrame: function(){ }
    });
  }
  this.start();
}

Histogram.prototype.getSpace = function(){
  var c = this.get('count');
  return 2 * (this.dims.w)/(c * 2 - 1);
}

function pad (v) {
  return v.toString().length > 1? v.toString() : '0' + v;
}

function currentTime () {
  var d = new Date();
  return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}

function labelFormat (v) {
  if (v > 1000) {
    return (v/1000).toFixed(1) + 'k';
  }
  return v.toFixed(0);
}

Histogram.prototype.drawXaxis = function() {
  var ctx = this.ctx;
  var space = this.getSpace();
  ctx.strokeStyle = this.styles.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = this.styles.color;
  this.labels.forEach(function(label) {
    var x = label.x;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 5);
    ctx.stroke();
    ctx.fillText(label.text, x, 8);
  }.bind(this));
}

Histogram.prototype.draw = function(delta) {
  this.labels.forEach(function(label) {
    label.onFrame(delta);
  })
  this.items.forEach(function(bar) {
    bar.onFrame(delta);
  })
  Chart.prototype.draw.call(this);
  var count = this.get('count');
  var color = this.get('colors')[0];
  var w = this.getSpace()/2;
  var ctx = this.ctx;
  ctx.fillStyle = color;
  this.items.forEach(function(item) {
    ctx.fillRect(item.x, item.y, w, 0 - item.y);
  })
  //min & max
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = this.styles.color;
  var min = this.get('min');
  var max = this.get('max');
  ctx.fillText(labelFormat(min), -2, 0);
  ctx.textBaseline = 'top';
  ctx.fillText(labelFormat(max), -2 , - this.dims.h);
  //bottom line
  ctx.strokeStyle = this.styles.color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(this.dims.w + 5 , 0);
  ctx.stroke();
  this.drawXaxis();
  ctx.restore();
}

module.exports = Histogram;
