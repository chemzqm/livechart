var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var style = require ('style');

var pl = parseInt(style('.livechart .linechart', 'padding-left'), 10);
var pr = parseInt(style('.livechart .linechart', 'padding-right'), 10);
var pb = parseInt(style('.livechart .linechart', 'padding-bottom'), 10);
var pt = parseInt(style('.livechart .linechart', 'padding-top'), 10);
var radius = parseInt(style('.livechart .linechart', 'border-radius'), 10);

function LineChart(parent){
  Chart.call(this, parent);
  this.set('count', 5);
  this.set('colors', ['#F7464A', '#4A46F7']);
}

inherit(LineChart, Chart);

LineChart.prototype.add = function(v){
  v = ( v instanceof Array)? v : [v];
  if (!this.series) {
    this.series = v.map(function() {
      return [];
    });
  }
  v.forEach(function(d, i) {
    this.series[i].push({
      value: d
    });
  }.bind(this));
  var count = this.get('count');
  if (this.series[0].length > count + 1) {
    this.series.forEach(function(ps) {
      ps.shift();
    });
  }
  var space = this.getSpace();
  this.series.forEach(function(ps) {
    ps.forEach(function(p, i) {
      var v = p.value;
      var ty = this.getY(v, ps);
      var tx = (i + count - ps.length) * space;
      if (!p.x) {
        p.x = tx;
        p.y = ty;
        p.onFrame = function(){};
      } else {
        p.onFrame = this.tween({ x: p.x, y: p.y }, { x: tx, y: ty });
      }
    }.bind(this));
  }.bind(this));
  this.start();
}

LineChart.prototype.getSpace = function(){
   return (this.width - pl - pr)/(this.get('count') - 1);
}

LineChart.prototype.getY = function(v, ps){
  var minValue = min(ps, 'value');
  var maxValue = max(ps, 'value');
  var h = this.height - pb -2*pt;
  if (minValue == maxValue) return - h/2;
  var y = 0 - h * (v - minValue)/(maxValue - minValue);
  return y;
}

LineChart.prototype.drawValues = function(p1, p2) {
  var ctx = this.ctx;
  var format = this.get('format');
  ctx.textBaseline = 'bottom';
  var top = p1.y <= p2.y ? p1 : p2;
  var bottom = p1.y > p2.y ? p1 : p2;
  var tv = format(top.value);
  var bv = format(bottom.value);
  ctx.fillText(tv, top.x, top.y - 5);
  ctx.textBaseline = 'top';
  ctx.fillText(bv, bottom.x, bottom.y + 5);
}

LineChart.prototype.drawLine = function(ps, i) {
  var ctx = this.ctx;
  var color = this.get('colors')[i];
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.beginPath();
  //ctx.shadowColor = 'rgb(153,153,153)';
  //ctx.shadowOffsetY = 1;
  //ctx.shadowBlur = 10;
  ps.forEach(function(p, i) {
    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  })
  ctx.stroke();
}

LineChart.prototype.draw = function(delta) {
  this.series.forEach(function(ps) {
    ps.forEach(function(p) {
      p.onFrame(delta);
    });
  })
  var count = this.get('count');
  var ctx = this.ctx;
  ctx.clearRect(0, - this.height, this.width, this.height);
  ctx.save();
  this.drawLabels();
  ctx.font = this.styles.fontSize + ' helvetica';
  ctx.translate(pl, -pb);
  ctx.textAlign = 'center';
  ctx.fillStyle = this.styles.color;
  ctx.strokeStyle = this.styles.color;
  if (this.series.length > 1) {
    this.series[0].forEach(function(p1, i) {
      var p2 = this.series[1][i];
      this.drawValues(p1, p2);
    }.bind(this));
  } else {
    var ps = this.series[0];
    ps.forEach(function(p) {
      var v = p.value;
      ctx.fillText(v, p.x, p.y - 5);
    })
  }
  //bottom line
  ctx.beginPath();
  var ly = pb - 15;
  var lx = - (pl - 5);
  ctx.moveTo(lx, ly);
  ctx.lineTo(this.width - pl - 5 , ly);
  ctx.stroke();
  var space = this.getSpace();
  ctx.textBaseline = 'top';
  for (var i = 0; i < count; i++) {
    var x = i * space;
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x , ly + 2);
    ctx.stroke();
    ctx.fillText((count - 1 - i) , x, ly + 2);
  }
  this.series.forEach(function(ps, i) {
    //line
    this.drawLine(ps, i);
    //point
    ps.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI*2, false);
      ctx.fill();
    });
  }.bind(this));
  ctx.restore();
}

module.exports = LineChart;
