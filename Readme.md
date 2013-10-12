
# livechart

  Canvas chart for display dynamic data with animatiion.

## Features

* **Lightweight**, < 12k when minified and gziped.

* **Scalable**, the canvas element could adjust itself when the container resized

* **Easy configuation**, using [style](https://github.com/component/style) and [configurable.js](https://github.com/visionmedia/configurable.js) for style and other option configuation.

* Retina support

## Installation

  Install with [component(1)](http://component.io):

    $ component install chemzqm/livechart

  Or include file `livechart.js` and `livechart.css` on your web page and use global value `livechart`.

## Example Usage

``` js
function random(i) {
  var res = [];
  while(i--) res.push(Math.random());
  return res;
}
var PieChart = require('livechart').PieChart;
var parent = document.getElementById("piechart");
var chart = new PieChart(parent);
chart.set('labels', ['Free', 'Wired', 'Active', 'Inactive']);
setInterval(function(){
  var values = random(4);
  chart.add(values);
}, 1000);
```

## API

### Options

Options are configured by the `set` method, this method works like below:

``` js
chart.set({
  min: 0,
  max: 100
})
```

Or

```
chart.set('min', 0);
chart.set('max', 100);
```

* `colors` optional color _Array_ for each series.
* `labels` optinal label _Array_ , lables are displayed on the left top corner (except `Barchart`).
* `min` optinal min _Number_ , chould be changed dynamicly when there's value lower.
* `max` optinal max _Number_ , chould be changed dynamicly when there's value higher.
* `count` max count _Number_, only used for `LineChart`, `AreaChart` and `Histogram`.
* `format` format _Function_ should return formatted value with orignal value as argument, used for `LineChart`, `AreaChart` , `BarChart` and `ArcChart`.
* `title` title _String_ , currently only used for `BarChart`.
* `ease` [ease](https://github.com/component/ease) function for animatiion, default `in-out-quad`.
* `duration` duration _Number_ in milisecond for animatiion, default `500`.

### LineChart(parentNode)

Append LineChart to `parentNode`, LineChart accept one or two series.

### LineChart#add(Number|Array)

Add one value or two values to LineChart.

### AreaChart(parentNode)

Append `AreaChart` to `parentNode`, AreaChart accept one or two series.

### AreaChart#add(Number|Array)

Add one value or two values to AreaChart.

### Histogram(parentNode)

Append `Histogram` to `parentNode`.

### Histogram#add(Number)

Add one value for histogram.

### PieChart(parentNode)

Append `PieChart` to `parentNode`.

### PieChart#add(Array)

Change values for `PieChart`.

### ArcChart(parentNode)

Append `ArcChart` to `parentNode`, ArcChart accept one or two series.

### ArcChart#add(Array)

Change values for `ArcChart`.

### PolarChart(parentNode)

Append `PolarChart` to `parentNode`.

### PolarChart#add(Array)

Change values for `PolarChart`.

## License

  MIT
