var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

var pl = parseInt(style('.livechart .histogram', 'padding-left'), 10);
var pr = parseInt(style('.livechart .histogram', 'padding-right'), 10);
var pb = parseInt(style('.livechart .histogram', 'padding-bottom'), 10);
var pt = parseInt(style('.livechart .histogram', 'padding-top'), 10);

function Histogram(parent){
  Chart.call(this, parent);
  this.set('count', 50);
  this.set('max', 100);
  this.set('min', 0);
  this.set('colors', ['#69D2E7']);
  this.bars = [];
  this.labels = [];
}

inherit(Histogram, Chart);

Histogram.prototype.getRange = function(){
  var minValue = min(this.bars, 'value');
  var maxValue = max(this.bars, 'value');
  minValue = Math.min(minValue, this.get('min'));
  maxValue = Math.max(maxValue, this.get('max'));
  this.set('min', minValue);
  this.set('max', maxValue);
  return {
    min: minValue,
    max: maxValue
  }
}

Histogram.prototype.add = function(v){
  var bars = this.bars;
  var bar = { value: v };
  var count = this.get('count');
  bars.push(bar)
  if (bars.length > count) {
    bars.shift();
  }
  var r = this.getRange();
  var space = this.getSpace();
  bars.forEach(function(bar, i) {
    var ty = 0 - (this.height - pb - pt) * (bar.value - r.min)/(r.max - r.min);
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
  var d = this.getSpace();
  var dw = ctx.measureText('00:00:00').width + 5;
  var first = this.labels[0];
  var last = this.labels[this.labels.length - 1];
  var tw = this.width - pl - pr - space * 1/4;
  if(first && first.x <= d) this.labels.shift();
  this.labels.forEach(function(label) {
    var x = label.x;
    label.onFrame = this.tween({x: x}, {x: x - d});
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
  return 2 * (this.width - pl - pr)/(c * 2 - 1);
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

Histogram.prototype.drawLabels = function() {
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
  this.bars.forEach(function(bar) {
    bar.onFrame(delta);
  })
  var count = this.get('count');
  var color = this.get('colors')[0];
  var w = this.getSpace()/2;
  var ctx = this.ctx;
  ctx.font = this.styles.fontSize + ' helvetica';
  ctx.clearRect(0, - this.height, this.width, this.height);
  ctx.save();
  ctx.translate(pl, -pb);
  ctx.fillStyle = color;
  this.bars.forEach(function(item) {
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
  ctx.fillText(labelFormat(max), -2 , pb + pt - this.height);
  //bottom line
  ctx.strokeStyle = this.styles.color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(this.width - pl - 5 , 0);
  ctx.stroke();
  this.drawLabels();
  ctx.restore();
}

module.exports = Histogram;
