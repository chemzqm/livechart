var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

function BarChart(parent){
  this.on('resize', function() {
    this.calcRectDimensions('barchart');
  }.bind(this))
  Chart.call(this, parent);
  this.set('max', 100);
  this.set('min', 0);
  this.set('colors', ['#D97041', '#C7604C', '#21323D', '#9D9B7F', '#7D4F6D', '#584A5E']);
  this.items = [];
}

inherit(BarChart, Chart);

BarChart.prototype.add = function(vs){
  var items = this.items;
  if (items.length === 0) {
    vs.forEach(function(v, i) {
      items.push({
        value: v,
        index: i
      });
    })
  }
  else {
    items.forEach(function(bar) {
      var v = vs[bar.index];
      bar.value = v;
    })
  }
  var r = this.getRange();
  this.items = items.sort(function(a, b) {
    return b.value - a.value;
  })
  var space = this.getSpace();
  this.items.forEach(function(bar, i) {
    var tx= (i + 1) * space;
    var ty = 0 - (this.dims.h) * (bar.value - r.min)/(r.max - r.min);
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
  var c = this.get('labels').length;
  return (this.dims.w)/(c + 1);
}

BarChart.prototype.draw = function(delta) {
  this.items.forEach(function(item) {
    item.onFrame(delta);
  })
  Chart.prototype.draw.call(this);
  var fontColor = this.styles.color;
  var colors = this.get('colors');
  var labels = this.get('labels');
  var ctx = this.ctx;
  var format = this.get('format');
  var cw = parseInt(style('.livechart .barchart .item', 'width'), 10);
  this.items.forEach(function(item) {
    var i = item.index;
    ctx.fillStyle = colors[i];
    ctx.fillRect(item.x - cw/2, item.y, cw, 0 - item.y);
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
  ctx.lineTo(this.dims.w, 0);
  ctx.stroke();
  //title
  var title = this.get('title');
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'center';
  ctx.fillStyle = this.styles.titleColor;
  ctx.font = this.styles.titleSize + ' helvetica';
  ctx.fillText(title, this.dims.w/2, - this.dims.h - 5);
  ctx.restore();
}

module.exports = BarChart;
