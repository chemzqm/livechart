var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

var pl = parseInt(style('.livechart .barchart', 'padding-left'), 10);
var pr = parseInt(style('.livechart .barchart', 'padding-right'), 10);
var pb = parseInt(style('.livechart .barchart', 'padding-bottom'), 10);
var pt = parseInt(style('.livechart .barchart', 'padding-top'), 10);
var columnWidth = parseInt(style('.livechart .barchart .item', 'width'), 10);

function BarChart(parent){
  Chart.call(this, parent);
  this.set('max', 100);
  this.set('min', 0);
  this.set('format', function (v) { return v; });
  this.set('colors', ['#D97041', '#C7604C', '#21323D', '#9D9B7F', '#7D4F6D', '#584A5E']);
  this.bars = [];
}

inherit(BarChart, Chart);

BarChart.prototype.getRange = function(){
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

BarChart.prototype.add = function(vs){
  var bars = this.bars;
  var init = (this.bars.length === 0);
  if (init) {
    vs.forEach(function(v, i) {
      bars.push({
        value: v,
        index: i
      });
    })
  }
  else {
    bars.forEach(function(bar) {
      var v = vs[bar.index];
      bar.value = v;
    })
  }
  var r = this.getRange();
  this.bars = this.bars.sort(function(a, b) {
    return b.value - a.value;
  })
  var space = this.getSpace();
  this.bars.forEach(function(bar, i) {
    var tx= (i + 1) * space;
    var ty = 0 - (this.height - pb - pt) * (bar.value - r.min)/(r.max - r.min);
    bar.onFrame = this.tween({
      x: bar.x || tx,
      y: bar.y || 0
    }, {
      x: tx,
      y: ty
    })
  }.bind(this));
  this.start();
}

BarChart.prototype.getSpace = function(){
  var count = this.get('labels').length;
  return (this.width - pl)/(count + 1);
}

BarChart.prototype.draw = function(delta) {
  this.bars.forEach(function(item) {
    item.onFrame(delta);
  })
  var fontColor = this.styles.color;
  var colors = this.get('colors');
  var labels = this.get('labels');
  var ctx = this.ctx;
  var format = this.get('format');
  ctx.font = this.styles.fontSize + ' helvetica';
  ctx.clearRect(0, - this.height, this.width, this.height);
  ctx.save();
  ctx.translate(pl, -pb);
  this.bars.forEach(function(item) {
    var i = item.index;
    ctx.fillStyle = colors[i];
    ctx.fillRect(item.x - columnWidth/2, item.y, columnWidth, 0 - item.y);
    //label
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var label = labels[i];
    ctx.fillText(label, item.x, 4);
    //value
    ctx.textBaseline = 'bottom';
    var v = format(item.value);
    ctx.fillText(v, item.x, item.y - 4);
  })
  //bottom line
  ctx.strokeStyle = fontColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(this.width - pl - pr, 0);
  ctx.stroke();
  //title
  var title = this.get('title');
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.fillStyle = this.styles.titleColor;
  ctx.font = this.styles.titleSize + ' helvetica';
  ctx.fillText(title, (this.width - pl -pr)/2, - this.height + pb + 5);
  ctx.restore();
}

module.exports = BarChart;
