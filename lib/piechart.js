var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');

function PieChart(parent){
  Chart.call(this, parent);
  this.set('colors', ['#F38630', '#E0E4CC', '#69D2E7', '#9D9B7F', '#F7464A', '#584A5E']);
  this.items = [];
}

inherit(PieChart, Chart);

PieChart.prototype.add = function(vs){
  var items = this.items;
  var init = (items.length === 0);
  var total = vs.reduce(function(res, v) {
    return res + v;
  }, 0);
  vs.forEach(function(v, i) {
    if (init) {
      items.push({ value: v/total });
    } else {
      items[i].value = v/total;
    }
  });
  this.items.forEach(function(item, i) {
    var a = item.value * Math.PI * 2;
    item.onFrame = this.tween({
      a: item.a || 0
    }, {
      a: a
    })
  }.bind(this));
  this.start();
}

PieChart.prototype.draw = function(delta) {
  this.items.forEach(function(item) {
    item.onFrame(delta);
  })
  var fontColor = this.styles.color;
  var colors = this.get('colors');
  var w = Math.min(this.width, this.height);
  var radius = (w - 10)/2;
  var tx = (this.width - w)/2 + w/2;
  var ty = (this.height - w)/2 + w/2;
  var ctx = this.ctx;
  ctx.font = this.styles.fontSize + ' helvetica';
  ctx.clearRect(0, - this.height, this.width, this.height);
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.translate(tx, - ty);
  ctx.lineWidth = 1;
  ctx.rotate(- Math.PI/2);
  this.items.forEach(function(item, i) {
    var a = item.a;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.arc(0, 0, radius, 0, a, false);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();
    ctx.rotate(a);
  });
  //draw text
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  var angle = 0;
  ctx.rotate(Math.PI/2);
  this.items.forEach(function(item) {
    var a = angle + item.a/2;
    angle += item.a;
    if (item.value < 0.05) return;
    var x = (radius/2) * Math.sin(a);
    var y = - (radius/2) * Math.cos(a);
    ctx.fillText((item.value * 100).toFixed(1), x, y);
  })
  this.drawLabels();
  ctx.restore();
}

module.exports = PieChart;
