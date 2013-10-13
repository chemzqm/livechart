var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

function ArcChart(parent){
  this.on('resize', function() {
    this.calcCircleDimensions('arcchart');
  }.bind(this))
  Chart.call(this, parent);
  this.set('colors', ['#97BBCD', '#DCDCDC']);
  this.items = [];
}

inherit(ArcChart, Chart);

ArcChart.prototype.add = function(vs){
  if (typeof vs === 'number') vs = [vs];
  var items = this.items;
  var init = items.length === 0;
  vs.forEach(function(v, i) {
    if (init) {
      items.push({ value: v })
    } else {
      items[i].value = v;
    }
  });
  items.forEach(function(item, i) {
    var a = item.value * Math.PI * 2;
    item.onFrame = this.tween({
      a: item.a || 0
    }, {
      a: a
    })
  }.bind(this));
  this.start();
}

ArcChart.prototype.draw = function(delta) {
  this.items.forEach(function(item) {
    item.onFrame(delta);
  });
  Chart.prototype.draw.call(this);
  var colors = this.get('colors');
  var radius = this.dims.r;
  var ctx = this.ctx;
  var itemClass = '.livechar .arcchart .item';
  var width = parseInt(style(itemClass, 'width'), 10);
  var gap = parseInt(style(itemClass, 'margin'), 10);
  this.items.forEach(function(item, i) {
    var a = item.a;
    var r = radius - (width + gap)*i;
    var color = colors[i];
    var rgb = this.toRgb(color);
    ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b +', ' + item.value + ')';
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, - (r - width));
    ctx.lineTo(0 , - r);
    ctx.arc(0, 0, r, - Math.PI/2, a - Math.PI/2, false);
    ctx.lineTo((r - width)*Math.cos(a - Math.PI/2), (r - width)*Math.sin(a - Math.PI/2));
    ctx.arc(0, 0, r - width, a - Math.PI/2, - Math.PI/2, true);
    ctx.fill();
    ctx.stroke();
  }.bind(this));
  //draw text
  ctx.font = '20px helvetica';
  if (this.items.length === 1) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = colors[0];
    ctx.fillText((this.items[0].value*100).toFixed(1), 0, 0);
  } else {
    ctx.strokeStyle = '#eeeeee';
    ctx.beginPath();
    ctx.moveTo(15, - 15);
    ctx.lineTo(- 15, 15);
    ctx.stroke();
    this.items.forEach(function(item, i) {
      ctx.fillStyle = colors[i];
      var text = (item.value * 100).toFixed(1);
      if (i === 0) {
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'right';
        ctx.fillText(text, 0 , 0);
      } else {
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillText(text, 0, 0);
      }
    })
  }
  this.drawLabels();
  ctx.restore();
}

module.exports = ArcChart;
