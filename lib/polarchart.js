var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

var fontSize = style('.livechart .polarchart .label', 'font-size');
var color = style('.livechart .polarchart .label', 'color');
var steps = [20, 40, 60, 80, 100];
var borderColor = style('.livechart .polarchart .segment', 'border-color');

function PolarChart(parent){
  Chart.call(this, parent);
  this.set('colors', ['#D97041', '#C7604C', '#21323D', '#9D9B7F', '#7D4F6D', '#584A5E']);
  this.items = [];
}

inherit(PolarChart, Chart);

PolarChart.prototype.add = function(vs){
  var items = this.items;
  var init = (items.length === 0);
  vs.forEach(function(v, i) {
    if (init) { items.push({ r: 0 }) }
    items[i].onFrame = this.tween({
      r: items[i].r
    }, {
      r: v
    });
  }.bind(this));
  this.start();
}

PolarChart.prototype.draw = function(delta) {
  this.items.forEach(function(item) {
    item.onFrame(delta);
  })
  var fontColor = this.styles.color;
  var colors = this.get('colors');
  var stepAngle = Math.PI * 2/this.items.length;
  var w = Math.min(this.width, this.height);
  var radius = (w - 10)/2;
  var tx = (this.width - w)/2 + w/2;
  var ty = (this.height - w)/2 + w/2;
  var ctx = this.ctx;
  ctx.font = this.styles.fontSize + ' helvetica';
  ctx.clearRect(0, - this.height, this.width, this.height);
  ctx.save();
  ctx.translate(tx, - ty);
  ctx.lineWidth = 1;
  ctx.rotate(- Math.PI/2);
  ctx.strokeStyle = borderColor;
  this.items.forEach(function(item, i) {
    var r = item.r;
    var rgb = this.toRgb(colors[i]);
    ctx.fillStyle = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.arc(0, 0, radius * r, 0, stepAngle, false);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();
    ctx.rotate(stepAngle);
  }.bind(this));
  //draw circles
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  steps.forEach(function(v) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * v/100, 0, Math.PI*2, false);
    ctx.stroke();
  })
  ctx.rotate(Math.PI/2);
  //draw text
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = fontSize + ' helvetica';
  var size = parseInt(fontSize, 10);
  steps.forEach(function(t) {
    var w = ctx.measureText(t).width;
    var y = - radius*t/100;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillRect(- w/2 - 2, y - size/2 -2, w + 4, size + 4);
    ctx.fillStyle = color;
    ctx.fillText(t, 0, y);
  })
  this.drawLabels();
  ctx.restore();
}

module.exports = PolarChart;
