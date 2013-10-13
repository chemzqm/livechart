var min = require ('min');
var max = require ('max');
var inherit = require('inherit');
var Chart = require ('./chart');
var LineChart = require ('./linechart');
var style = require ('style');

function AreaChart(parent){
  this.on('resize', function() {
    this.calcRectDimensions('areachart');
  }.bind(this))
  Chart.call(this, parent);
  this.set('count', 10);
  this.set('colors', ['#DCDCDC', '#97BBCD']);
}

inherit(AreaChart, LineChart);

AreaChart.prototype.drawLine = function(ps, i) {
  var ctx = this.ctx;
  var color = this.get('colors')[i];
  var rgb = this.toRgb(color);
  ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b +', 0.5)';
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.lineWidth = 2;
  var space = this.getSpace();
  ps.forEach(function(p, i) {
    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      var prev = ps[i - 1];
      if (p.x - prev.x < space/2) {
        ctx.lineTo(p.x, p.y);
      } else{
        ctx.bezierCurveTo(prev.x + space/2, prev.y, prev.x + space/2, p.y, p.x, p.y);
      }
    }
  })
  ctx.stroke();
  var y = parseInt(this.styles.fontSize, 10) + 10;
  ctx.lineTo(ps[ps.length - 1].x, y);
  ctx.lineTo(ps[0].x, y);
  ctx.fill();
}

AreaChart.prototype.draw = function(delta) {
  var radius = parseInt(style('.livechart .areachart .point', 'width'), 10);
  var borderWidth = parseInt(style('.livechart .areachart .pointborder', 'width'), 10);
  var borderColor = style('.livechart .areachart .pointborder', 'color');
  var ctx = this.ctx;
  this.series.forEach(function(ps) {
    ps.forEach(function(p) {
      p.onFrame(delta);
    });
  })
  Chart.prototype.draw.call(this);
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
  this.series.forEach(function(ps, i) {
    //line
    this.drawLine(ps, i);
    var color = this.get('colors')[i];
    ctx.fillStyle = color;
    //point
    ps.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI*2, false);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.arc(p.x, p.y, radius + 1, 0, Math.PI*2, false);
      ctx.stroke();
    });
  }.bind(this));
  this.drawXaxis();
  ctx.restore();
}

module.exports = AreaChart;
