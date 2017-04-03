(function() {
  'use strict';

  class pxVisDemosDynamicAdd {
    /* Name for the component */
    get is() { return 'px-vis-demos-dynamic-add'; }

    /* Behaviors to import for this component */


    /* Properties for this component */
    get properties() {
      return {
        /**
        *
        */
        chartTypes: {
          type: Array,
          value: function() {
            return [{"key":"px-vis-timeseries","val":"px-vis-timeseries"},{"key":"px-vis-xy-chart","val":"px-vis-xy-chart"},{"key":"px-vis-polar","val":"px-vis-polar"},{"key":"px-vis-radar","val":"px-vis-radar"},{"key":"px-vis-parallel-coordinates","val":"px-vis-parallel-coordinates"},/*{"key":"px-vis-pie-chart","val":"px-vis-pie-chart"}*/];
          },
          readOnly: true
        },
        selectedChartType: {
          type: String
        },
        dataSets: {
          type: Object,
          value: function() {
            return {
              'px-vis-timeseries': [{ 'key': 'dummy', 'val': 'PLEASE GENERATE DATA'}],
              'px-vis-xy-chart': [{ 'key': 'dummy', 'val': 'PLEASE GENERATE DATA'}],
              'px-vis-polar': [{ 'key': 'dummy', 'val': 'PLEASE GENERATE DATA'}],
              'px-vis-radar': [{ 'key': 'dummy', 'val': 'PLEASE GENERATE DATA'}],
              'px-vis-parallel-coordinates': [{ 'key': 'dummy', 'val': 'PLEASE GENERATE DATA'}]
              // 'px-vis-pie-chart': [{ 'key': 'dummy', 'val': 'please generate data'}]
            };
          }
        },
        chartPool: {
          type: Object,
          value: function() {
            return {
              'px-vis-timeseries': [],
              'px-vis-xy-chart': [],
              'px-vis-polar': [],
              'px-vis-radar': [],
              'px-vis-parallel-coordinates': [],
              'px-vis-pie-chart': []
            };
          }
        },
        _currentDataSets: {
          type: Array
        },
        _generateListener: {
          type: Function
        },
        _createListener: {
          type: Function
        },
        _removeListener: {
          type: Function
        },
        _drawingListener: {
          type: Function
        },
        _moveListener: {
          type: Function
        },
        _generateOptions: {
          type: Object,
          value: function() {
            return {
              'startTime': 571474800000,
              'endTime': Math.floor(Date.now() ),
              'dataMin': -10,
              'dataMax': 10,
              'variance': 0.7,
              'counter': 0,
              'randomise': false
            };
          }
        },
        _chartOptions: {
          type: Object,
          value: function() {
            //change me to change default values when loading the page
            return {
              'scatter': false,
              'disableNav': false,
              'canvas': false,
              'progressiveRendering': false,
              'pointsPerFrame': 16000,
              'minFrames': 1,
              'addDynamicMenus': false,
              'addThresholds': false,
              'multiAxis': false,
              'rendToSvg': false,
              'resizeDebounce': 250,
              'noProgressiveRendering': false,
              'width': 800,
              'height': 500,
              'preventResize': false
            };
          }
        },
        _drawingCounter: {
          type: Number,
          value:0
        },
        _drawingsPerChart: {
          type: Number,
          value:0
        },
        _drawingNumberOfCharts: {
          type: Number,
          value:0
        },
        _drawingTimerName: {
          type: String
        }
      };
    }

    get observers(){
      return [
        '_computeCurrentDataSets(selectedChartType, dataSets.*)'
      ];
    }

    attached() {
      this._generateListener = this._generateDataSet.bind(this);
      this._createListener = this._createChart.bind(this);
      this._removeListener = this._removeChart.bind(this);
      this._drawingListener = this._drawingListen.bind(this);
      this._moveListener = this._moveChart.bind(this);
      this.$.generate.addEventListener('click', this._generateListener);
      this.$.btnCreate.addEventListener('click', this._createListener);
      this.$.btnRemove.addEventListener('click', this._removeListener);
      this.$.btnMove.addEventListener('click', this._moveListener);
      this.addEventListener('px-vis-scatter-rendering-ended', this._drawingListener);
      this.addEventListener('px-vis-line-svg-rendering-ended', this._drawingListener);
      this.addEventListener('px-vis-line-canvas-rendering-ended', this._drawingListener);
      this.addEventListener('px-vis-scatter-canvas-rendering-ended', this._drawingListener);
    }

    detached() {
      this.$.generate.removeEventListener('click', this._generateListener);
      this.$.btnCreate.removeEventListener('click', this._createListener);
      this.$.btnRemove.removeEventListener('click', this._removeListener);
      this.$.btnMove.removeEventListener('click', this._moveListener);
      this.removeEventListener('px-vis-scatter-rendering-ended', this._drawingListener);
      this.removeEventListener('px-vis-line-svg-rendering-ended', this._drawingListener);
      this.removeEventListener('px-vis-line-canvas-rendering-ended', this._drawingListener);
      this.removeEventListener('px-vis-scatter-canvas-rendering-ended', this._drawingListener);
    }

    _generateDataSet() {

      var dataSet = this._generateData(this.$.pointsPerSeries.value, this.$.seriesNumber.value, this.selectedChartType);

      //remove placeholder if needed and append new dataset
      if(this.dataSets[this.selectedChartType][0].key === 'dummy') {
        this.dataSets[this.selectedChartType][0] = dataSet;
      } else {
        this.dataSets[this.selectedChartType].push(dataSet);
      }

      this._computeCurrentDataSets();

      //TODO: sort by size
    }

    _generateData(pointsNumber, seriesNumber, chartType) {


      console.time(`generating ${pointsNumber*seriesNumber} total (${seriesNumber} series each ${pointsNumber} points) for ${chartType}`);

      var result = [],
          step = Math.floor((this._generateOptions.endTime - this._generateOptions.startTime)/pointsNumber),
          isPolar = chartType === 'px-vis-polar';

      this._generateOptions.counter++;

      for(var i=0; i<pointsNumber; i++) {
        var newData = {};

        newData.timeStamp = this._generateOptions.startTime + i*step;

        for(var j=0; j<seriesNumber; j++) {

          if(result.length === 0 || this._generateOptions.randomise) {
            newData[`y${j}`] = Math.random() * (this._generateOptions.dataMax - this._generateOptions.dataMin) + this._generateOptions.dataMin;
          } else {
            //contain change within 10% of previous value
            newData[`y${j}`] = result[i-1][`y${j}`] + (Math.random() * 2 -1) * this._generateOptions.variance;
          }
          newData['x'] = isPolar ? i%360 : i;
        }
        result.push(newData);
      }

      console.timeEnd(`generating ${pointsNumber*seriesNumber} total (${seriesNumber} series each ${pointsNumber} points) for ${chartType}`);

      return {'val': `[Gen][${this._generateOptions.counter}] ${pointsNumber*seriesNumber} total (${seriesNumber} series each ${pointsNumber} points)`  , 'key': result};
    }

    _computeCurrentDataSets() {

      this.set('_currentDataSets',[{'key': '1', 'val': 'dummy'}]);
      this.set('_currentDataSets',this.dataSets[this.selectedChartType]);

      //select 1st item
      if(this.dataSets[this.selectedChartType] && this.dataSets[this.selectedChartType][0]) {
        this.$.dataSetDropdown.set('displayValue', this.dataSets[this.selectedChartType][0].val);
        this.$.dataSetDropdown.set('selectedKey', this.dataSets[this.selectedChartType][0].key);
      }
    }

    _canScatter(selectedChartType) {
      return selectedChartType !== 'px-vis-parallel-coordinates' && selectedChartType !== 'px-vis-radar' && selectedChartType !== 'px-vis-pie-chart' && selectedChartType !== 'px-vis-polar';
    }

    _canCanvas(selectedChartType) {
      return selectedChartType === 'px-vis-timeseries' || selectedChartType === 'px-vis-xy-chart';
    }

    _canSvg(selectedChartType) {
      return selectedChartType === 'px-vis-parallel-coordinates' || selectedChartType === 'px-vis-radar';
    }

    _canProgRender(selectedChartType, canvas, svg) {
      return (this._canCanvas(selectedChartType) && canvas) || (this._canSvg(selectedChartType) && !svg);
    }

    _isTimeseries(selectedChartType) {
      return selectedChartType === 'px-vis-timeseries';
    }

    _canMultiY(selectedChartType) {
      return selectedChartType === 'px-vis-timeseries' || selectedChartType === 'px-vis-xy-chart';
    }

    _createChart() {

      var data = this.$.dataSetDropdown.selectedKey;

      if(data === 'dummy') {
        console.log(`No data selected, please generate data for ${this.selectedChartType}`);
        return;
      }

      if(data) {
        this._drawingCounter = 0;
        this._drawingsPerChart = this._getNumberOfDrawingPerCharts(data);
        this._drawingNumberOfCharts = this.$.chartNumber.value;
        this._drawingTimerName = `draw ${this._drawingNumberOfCharts} ${this.selectedChartType}`;

        var newDiv = document.createElement('div'),
                newChart;

        newDiv.classList.add('divwrapper');
        window.performance.clearMarks();
        window.performance.mark('start');


        //finally append all charts in our element
        Polymer.dom(this.$.chartHolder).appendChild(newDiv);


        //create the requested number of charts
        for(var i=0;i <this._drawingNumberOfCharts; i++) {

          //reuse charts if asked, create otherwise
          if(this.$.reuse.checked) {
            if(this.chartPool[this.selectedChartType].length) {
              newChart = this.chartPool[this.selectedChartType].pop();

              //newChart.width = newChart.width -1;
            } else {
              console.log(`failed to reuse ${this.selectedChartType} from chartPool, none available`);
              newChart = document.createElement(this.selectedChartType);
            }
          } else {
            newChart = document.createElement(this.selectedChartType);
          }

          //adjust div height if needed
          newChart.preventResize = this._chartOptions.preventResize;
          if(!newChart.preventResize) {
            newDiv.style['height'] = `${this._chartOptions.height}px`;
          }

          //append chart in div
          Polymer.dom(newDiv).appendChild(newChart);

          //process all chart options
          if(newChart.preventResize) {
            newChart.height = this._chartOptions.height;
            newChart.width = this._chartOptions.width;
          }
          newChart.debounceResizeTiming = this._chartOptions.resizeDebounce;
          this._processOptions(newChart);
          newChart.chartData = data;
        }

      } else {
        console.log('please select data');g
      }
    }

    _removeChart() {
      var wrappers = Polymer.dom(this.root).querySelectorAll('.divwrapper'),
          lastWrap = wrappers[wrappers.length - 1];

      if(lastWrap) {

        //store used charts for later
        for(var i=0; i<lastWrap.children.length; i++) {
          this.chartPool[lastWrap.children[i].nodeName.toLowerCase()].push(lastWrap.children[i]);
        }

        Polymer.dom(this.$.chartHolder).removeChild(lastWrap);
      }
    }

    _moveChart() {
      var wrappers = Polymer.dom(this.root).querySelectorAll('.divwrapper'),
          lastWrap = wrappers[wrappers.length - 1];

      if(lastWrap) {


        Polymer.dom(this.$.chartHolder).removeChild(lastWrap);

        setTimeout(function() {
          window.performance.clearMarks();
          window.performance.mark('start');
        Polymer.dom(this.$.chartHolder).appendChild(lastWrap);
        }.bind(this),500);

      }
    }

    _drawingListen() {
      this._drawingCounter++;

      if(this._drawingCounter%(this._drawingsPerChart*Number(this._drawingNumberOfCharts)) === 0) {
        window.performance.mark('end');
        performance.clearMeasures();
        window.performance.measure('lastMeasure', 'start', 'end');
        var duration = window.performance.getEntriesByName('lastMeasure')[0].duration;
        console.log(`${this._drawingTimerName}: ${duration} (average per chart: ${duration/Number(this._drawingNumberOfCharts)})`);
      }
    }

    _getNumberOfDrawingPerCharts(data) {

      switch(this.selectedChartType) {
        case 'px-vis-timeseries':
          //deduct time + x
          var multiplier = this._chartOptions.disableNav ? 1 : 2;
          return multiplier * (Object.keys(data[0]).length -2);
        case 'px-vis-xy-chart':
          //deduct time + x
          return Object.keys(data[0]).length -2;
        case 'px-vis-polar':
          return 1;
        case 'px-vis-parallel-coordinates':
          //1massive multiline
          return 1;
        case 'px-vis-radar':
          //1massive multiline
          return 1;
        case 'px-vis-pie-chart':
          //TODO
      }
    }

    _processOptions(chart) {

      switch(this.selectedChartType) {
        case 'px-vis-timeseries':
          this._processOptionsTS(chart);
          break;
        case 'px-vis-xy-chart':
          this._processOptionsXY(chart);
          break;
        case 'px-vis-polar':
          this._processOptionsPolar(chart);
          break;
        case 'px-vis-parallel-coordinates':
          this._processOptionsParallel(chart);
          break;
        case 'px-vis-radar':
          this._processOptionsRadar(chart);
          break;
        case 'px-vis-pie-chart':
          //TODO
      }
    }

    _processOptionsTS(chart) {

      var seriesConfig = {},
          seriesNumber = this._chartOptions.disableNav ? this._drawingsPerChart : this._drawingsPerChart/2;

      for(var i=0; i<seriesNumber; i++) {


        if(this._chartOptions.multiAxis) {
          seriesConfig[`series${i}`] = {
            'x': 'timeStamp',
            'y': `y${i}`,
            'type': this._chartOptions.scatter ? 'scatter' : 'line',
            'axis': {
              'id': `axis${i}`,
              'number': i,
              'side': i < seriesNumber/2 ? 'left' : 'right'
            }
          };
        } else {
          seriesConfig[`series${i}`] = {
            'x': 'timeStamp',
            'y': `y${i}`,
            'type': this._chartOptions.scatter ? 'scatter' : 'line'
          };
        }
      }

      chart.set('seriesConfig', seriesConfig);
      chart.set('renderToCanvas', this._chartOptions.canvas);
      if(chart.renderToCanvas) {
        chart.noCanvasProgressiveRendering = this._chartOptions.noProgressiveRendering;
        chart.progressiveRenderingPointsPerFrame = this._chartOptions.pointsPerFrame;
        chart.progressiveRenderingMinimumFrames = this._chartOptions.minFrames;
      }

      chart.chartExtents = {
        "x": ["dynamic", "dynamic"],
        "y": ["dynamic","dynamic"]
      };
      chart.xAxisConfig = {"title": "X",
            "labelPosition": "center",
            "orientation": "bottom"};
      chart.yAxisConfig = {"title": "An Axis"};

      if(this._chartOptions.addEvents) {
        chart.eventData = [{"id":"123","time":1271474800000,"label":"Recalibrate"},{"id":"456","time":771474800000,"label":"Fan start"},{"id":"789","time":927525220000,"label":"Fan stop"},{"id":"333","time":1412163600000,"label":"Default"}];
        chart.eventConfig = {
                "Recalibrate":{
                  "color": "blue",
                  "icon": "fa-camera",
                  "type": "fa",
                  "offset":[0,0],
                  "lineColor": "red",
                  "lineWeight": 5
                },
                "Fan start":{
                  "color": "green",
                  "icon": "\uf015",
                  "type": "unicode",
                  "offset":[1,0]
                },
                "Fan stop":{
                  "color": "blue",
                  "icon": "fa-coffee",
                  "type": "fa",
                  "offset":[0,-20],
                  "size":"20"
                }
              };
      } else {
        //make sure we clean it
        chart.eventData = [];
        chart.eventConfig = {};
      }

      if(this._chartOptions.addThresholds) {
        chart.thresholdData = [
            { "for":"series0", "type":"max", "value":8.4784 },
            { "for":"series0", "type":"min", "value":-9.6531 },
            { "for":"series0", "type":"mean", "value":0.330657585139331 },
            { "for":"series1", "type":"mean", "value":2 },
            { "for":"series1", "type":"quartile", "value":-3 }
          ];
        chart.thresholdConfig = {
            "max": {
              "color": "red",
              "dashPattern": "5,0",
              "title": "MAX",
              "showThresholdBox": true,
              "displayTitle": true
            }
          };
      } else {
        //make sure we clean it
        chart.thresholdData = [];
        chart.thresholdConfig = {};
      }

      if(this._chartOptions.addDynamicMenus) {
        chart.dynamicMenuConfig = [{
              "name": "Delete",
              'action': "function(data) {var conf = this.seriesConfig;delete conf[data.additionalDetail.name];this.set(\"seriesConfig\", {}); this.set(\"seriesConfig\", conf);}",
              "eventName": "delete",
              "icon": "fa-trash"
            },
            {
              "name": "Bring To Front",
              "action": "function(data) { this.set(\"serieToRedrawOnTop\", data.additionalDetail.name);}",
              "eventName": "bring-to-front",
              "icon": "fa-arrow-up"
            }
          ];
      } else {
        chart.dynamicMenuConfig = [];
      }

      chart.disableNavigator = this._chartOptions.disableNav;


    }

    _processOptionsXY(chart) {

      var seriesConfig = {};
      for(var i=0; i<this._drawingsPerChart; i++) {

        if(this._chartOptions.multiAxis) {
          seriesConfig[`series${i}`] = {
            'x': 'x',
            'y': `y${i}`,
            'type': this._chartOptions.scatter ? 'scatter' : 'line',
            'axis': {
              'id': `axis${i}`,
              'number': i,
              'side': i < this._drawingsPerChart/2 ? 'left' : 'right'
            }
          };
        } else {
          seriesConfig[`series${i}`] = {
            'x': 'x',
            'y': `y${i}`,
            'type': this._chartOptions.scatter ? 'scatter' : 'line'
          };
        }
      }

      chart.xAxisConfig = {"title": "X",
            "labelPosition": "center",
            "orientation": "bottom"};
      chart.yAxisConfig = {"title": "An Axis"};
      chart.seriesConfig = seriesConfig;
      chart.margin={ "top": "30", "bottom": "60", "left": "80", "right": "100" };
      chart.timeData = 'timeStamp';
      chart.chartExtents = {
        "x": ["dynamic", "dynamic"],
        "y": ["dynamic","dynamic"]
      };

      chart.renderToCanvas = this._chartOptions.canvas;
      if(chart.renderToCanvas) {
        chart.noCanvasProgressiveRendering = this._chartOptions.noProgressiveRendering;
        chart.progressiveRenderingPointsPerFrame = this._chartOptions.pointsPerFrame;
        chart.progressiveRenderingMinimumFrames = this._chartOptions.minFrames;
      }

      if(this._chartOptions.addDynamicMenus) {
        chart.dynamicMenuConfig = [{
              "name": "Delete",
              "action": "function(data) { var conf = this.seriesConfig;  delete conf[data.additionalDetail.name]; this.set(\"seriesConfig\", {}); this.set(\"seriesConfig\", conf);}",
              "eventName": "delete",
              "icon": "fa-trash"
            },
            {
              "name": "Bring To Front",
              "action": "function(data) { this.set(\"serieToRedrawOnTop\", data.additionalDetail.name);}",
              "eventName": "bring-to-front",
              "icon": "fa-arrow-up"
            }
          ];
      } else {
        chart.dynamicMenuConfig = [];
      }
    }

    _processOptionsPolar(chart) {
       var seriesConfig = {};
      for(var i=0; i<this._drawingsPerChart; i++) {

        seriesConfig[`series${i}`] = {
          'x': 'x',
          'y': `y${i}`
        };
      }
      chart.height = 800;
      chart.seriesConfig = seriesConfig;
      chart.useDegrees = true;
      chart.margin={ "top": "0", "bottom": "0", "left": "10", "right": "10" };
      chart.timeData = 'timeStamp';

      // chart.renderToCanvas = this._chartOptions.canvas;
      // if(chart.renderToCanvas) {
      //   chart.progressiveRenderingPointsPerFrame = this._chartOptions.pointsPerFrame;
      //   chart.progressiveRenderingMinimumFrames = this._chartOptions.minFrames;
      // }

      if(this._chartOptions.addDynamicMenus) {
        chart.dynamicMenuConfig = [{
              "name": "Dummy",
              "action": "function(data) { console.log(\"dummy\")}",
              "eventName": "delete",
              "icon": "fa-trash"
            }
          ];
      } else {
        chart.dynamicMenuConfig = [];
      }
    }

    _processOptionsParallel(chart) {

      chart.generateAxesFromData = true;
      chart.matchTicks = true;
      chart.seriesKey = 'timeStamp';
      chart.skipKeys = {"x":true, "timeStamp": true};
      chart.renderToSvg = this._chartOptions.rendToSvg;
      chart.noCanvasProgressiveRendering = this._chartOptions.noProgressiveRendering;
      chart.progressiveRenderingPointsPerFrame = this._chartOptions.pointsPerFrame;
      chart.progressiveRenderingMinimumFrames = this._chartOptions.minFrames;

      if(this._chartOptions.addDynamicMenus) {
        chart.dynamicMenuConfig = [{
              "name": "Dummy",
              "action": "function(data) { console.log(\"dummy\")}",
              "eventName": "delete",
              "icon": "fa-trash"
            }
          ];
      } else {
        chart.dynamicMenuConfig = [];
      }

    }

    _processOptionsRadar(chart) {

      chart.generateAxesFromData = true;
      chart.matchTicks = true;
      chart.seriesKey = 'timeStamp';
      chart.skipKeys = {"x":true, "timeStamp": true};
      chart.renderToSvg = this._chartOptions.rendToSvg;
      chart.noCanvasProgressiveRendering = this._chartOptions.noProgressiveRendering;
      chart.progressiveRenderingPointsPerFrame = this._chartOptions.pointsPerFrame;
      chart.progressiveRenderingMinimumFrames = this._chartOptions.minFrames;

      if(this._chartOptions.addDynamicMenus) {
        chart.dynamicMenuConfig = [{
              "name": "Dummy",
              "action": "function(data) { console.log(\"dummy\")}",
              "eventName": "delete",
              "icon": "fa-trash"
            }
          ];
      } else {
        chart.dynamicMenuConfig = [];
      }
    }

    //mmmmm pie....
    _processOptionsPie(chart) {

    }

  }

  /* Register this element with the Polymer constructor */
  Polymer(pxVisDemosDynamicAdd);
})();
