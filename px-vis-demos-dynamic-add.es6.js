(function() {
  'use strict';

  Polymer({
    /* Name for the component */
    is: 'px-vis-demos-dynamic-add',

    /* Behaviors to import for this component */
    behaviors: [
      PxVisBehaviorDemo.chartGenerator,
      PxVisBehaviorDemo.timings
    ],

    /* Properties for this component */
    properties: {
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
        type: String,
        value: 'px-vis-timeseries'
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
      }
    },

    observers:[
        '_computeCurrentDataSets(selectedChartType, dataSets.*)'
      ],

    attached: function() {
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
      this.addEventListener('px-vis-chart-canvas-rendering-ended', this._drawingListener);
    },

    detached: function() {
      this.$.generate.removeEventListener('click', this._generateListener);
      this.$.btnCreate.removeEventListener('click', this._createListener);
      this.$.btnRemove.removeEventListener('click', this._removeListener);
      this.$.btnMove.removeEventListener('click', this._moveListener);
      this.removeEventListener('px-vis-scatter-rendering-ended', this._drawingListener);
      this.removeEventListener('px-vis-line-svg-rendering-ended', this._drawingListener);
      this.removeEventListener('px-vis-chart-canvas-rendering-ended', this._drawingListener);
    },

    _generateDataSet: function() {

      var dataSet = this._generateData(this.$.pointsPerSeries.value, this.$.seriesNumber.value, this.selectedChartType);

      //remove placeholder if needed and append new dataset
      if(this.dataSets[this.selectedChartType][0].key === 'dummy') {
        this.dataSets[this.selectedChartType][0] = dataSet;
      } else {
        this.dataSets[this.selectedChartType].push(dataSet);
      }

      this._computeCurrentDataSets();

      //TODO: sort by size
    },

    _generateData: function(pointsNumber, seriesNumber, chartType, seriesNames) {

      console.time(`generating ${pointsNumber*seriesNumber} total (${seriesNumber} series each ${pointsNumber} points) for ${chartType}`);

      var result = [],
          step = Math.floor((this._generateOptions.endTime - this._generateOptions.startTime)/pointsNumber),
          isPolar = chartType === 'px-vis-polar',
          extents = {},
          yMins = {},
          yMaxs = {};

      if(chartType === 'px-vis-timeseries') {
        extents.x = [this._generateOptions.startTime, this._generateOptions.startTime + pointsNumber*step];
      } else if(chartType === 'px-vis-xy-chart') {
        extents.x = [0, pointsNumber];
      }

      this._generateOptions.counter++;

      for(var i=0; i<pointsNumber; i++) {
        var newData = {};

        newData.timeStamp = this._generateOptions.startTime + i*step;

        for(var j=0; j<seriesNumber; j++) {

          var name = seriesNames ? seriesNames[j] : `y${j}`,
              axisName = `axis${j}`;

          if(result.length === 0 || this._generateOptions.randomise) {
            newData[name] = (Math.random() * (this._generateOptions.dataMax - this._generateOptions.dataMin) + this._generateOptions.dataMin).toFixed(3);
            newData['x'] = isPolar ? Math.random() * 360 : 0;
          } else {
            //contain change within 10% of previous value
            newData[name] = (Number(result[i-1][name]) + (Math.random() * 2 -1) * this._generateOptions.variance).toFixed(3);
            newData['x'] = i;
          }

          if(chartType === 'px-vis-radar' || chartType === 'px-vis-parallel-coordinates') {
            //add some categories
            newData['category'] = (i%4).toString();
          }


          if(!extents[axisName]) {
            extents[axisName] = [Number.MAX_VALUE, -Number.MAX_VALUE];
          }
          //search for extents
          if( Number(newData[name]) < Number(extents[axisName][0])) {
            extents[axisName][0] = newData[name];
          }

          if( Number(newData[name]) >  Number(extents[axisName][1])) {
            extents[axisName][1] = newData[name];
          }
        }


        //find y extents in case we're not multi Y
        var extKeys = Object.keys(extents),
            min = Number.MAX_VALUE,
            max = -Number.MAX_VALUE;

        for(var k =0; k<extKeys.length; k++) {
          if(extKeys[k] !== 'x') {
            if(Number(extents[extKeys[k]][1]) > max ) {
              max = extents[extKeys[k]][1];
            }
            if(Number(extents[extKeys[k]][0]) < min) {
              min = extents[extKeys[k]][0];
            }
          }
        }

        extents.y = [min,max];

        result.push(newData);
      }

      console.timeEnd(`generating ${pointsNumber*seriesNumber} total (${seriesNumber} series each ${pointsNumber} points) for ${chartType}`);

      return {'val': `[Gen][${this._generateOptions.counter}] ${pointsNumber*seriesNumber} total (${seriesNumber} series each ${pointsNumber} points)` , 'key': { 'data': result, 'extents': extents}};
    },

    _computeCurrentDataSets: function() {

      this.set('_currentDataSets', this.dataSets[this.selectedChartType].slice());

      //select last item
      if(this.dataSets[this.selectedChartType] && this.dataSets[this.selectedChartType].length) {
        this.$.dataSetDropdown.set('displayValue', this.dataSets[this.selectedChartType][this.dataSets[this.selectedChartType].length-1].val);
        this.$.dataSetDropdown.set('selectedKey', this.dataSets[this.selectedChartType][this.dataSets[this.selectedChartType].length-1].key);
      }
    },

    _canScatter: function(selectedChartType) {
      return selectedChartType !== 'px-vis-parallel-coordinates' && selectedChartType !== 'px-vis-radar' && selectedChartType !== 'px-vis-pie-chart' && selectedChartType !== 'px-vis-polar';
    },

    _canCanvas: function(selectedChartType) {
      return selectedChartType === 'px-vis-timeseries' || selectedChartType === 'px-vis-xy-chart' || selectedChartType === 'px-vis-polar';
    },

    _canSvg: function(selectedChartType) {
      return selectedChartType === 'px-vis-parallel-coordinates' || selectedChartType === 'px-vis-radar';
    },

    _canProgRender: function(selectedChartType, canvas, svg) {
      return (this._canCanvas(selectedChartType) && canvas) || (this._canSvg(selectedChartType) && !svg);
    },

    _isTimeseries: function(selectedChartType) {
      return selectedChartType === 'px-vis-timeseries';
    },

    _isPolar: function(selectedChartType) {
      return selectedChartType === 'px-vis-polar';
    },

    _canMultiY: function(selectedChartType) {
      return selectedChartType === 'px-vis-timeseries' || selectedChartType === 'px-vis-xy-chart';
    },

    _canChartExtents: function(selectedChartType) {
      return selectedChartType !== 'px-vis-parallel-coordinates' && selectedChartType !== 'px-vis-polar';
    },

    _canWebWorker: function(selectedChartType) {
      return selectedChartType !== 'px-vis-parallel-coordinates' && selectedChartType !== 'px-vis-radar';
    },

    _createChart: function() {

      var data = this.$.dataSetDropdown.selectedKey.data,
          extents = this.$.dataSetDropdown.selectedKey.extents;

      if(this.$.dataSetDropdown.selectedKey === 'dummy') {
        console.log(`No data selected, please generate data for ${this.selectedChartType}`);
        return;
      }

      if(data) {
        this._initializeDrawingMeasures(this.selectedChartType, this._drawingNumberOfCharts, data);
        this._drawingTimerName = `draw ${this._drawingNumberOfCharts} ${this.selectedChartType}`;


        var newDiv,
            newChart,
            currWidth = this.$.chartHolder.getBoundingClientRect().width,
            fragment = document.createElement('div');

        fragment.classList.add('creationBatchDiv');

        //create the requested number of charts
        for(var i=0;i <this._drawingNumberOfCharts; i++) {

          newDiv = document.createElement('div');
          newDiv.classList.add('divwrapper');

          //reuse charts if asked, create otherwise
          if(this.$.reuse.checked) {
            if(this.chartPool[this.selectedChartType].length) {
              newChart = this.chartPool[this.selectedChartType].pop();

            } else {
              console.log(`failed to reuse ${this.selectedChartType} from chartPool, none available`);
              newChart = document.createElement(this.selectedChartType);
            }
          } else {
            newChart = document.createElement(this.selectedChartType);
          }

          this._processChartCreation(newChart, extents, data, currWidth);

          //append chart in div
          Polymer.dom(newDiv).appendChild(newChart);
          Polymer.dom(fragment).appendChild(newDiv);
        }

        //finally append all charts in our element
        Polymer.dom(this.$.chartHolder).appendChild(fragment);
        this._startPerfMeasure();

      } else {
        console.log('please select data');
      }
    },

    _generateSeriesName: function() {
      return `y${Math.floor(Math.random()*1000)}`;
    },

    _addSerieAndModifyData: function(info) {
      var numberOfSeries = Object.keys(info.chart.chartData[0]).length - 2,
          seriesNames = Object.keys(info.chart.chartData[0]).filter(function(d, i) { return d[0] === 'y';}),
          data,
          seriesName  = this._generateSeriesName();

      seriesNames.push(seriesName);

      data = this._generateData(info.chart.chartData.length, numberOfSeries + 1, info.chart.nodeName.toLowerCase(), seriesNames);

      info.chart.set('chartData', data.key.data);

      this._addOneSerieFromConfig(info.chart, numberOfSeries, seriesName);
    },

    _removeSerieAndModifyData: function(info) {
      var data,
          seriesNames = Object.keys(info.chart.chartData[0]).filter(function(d, i) { return d[0] === 'y';});

      data = this._generateData(info.chart.chartData.length, Object.keys(info.chart.chartData[0]).length - 3, info.chart.nodeName.toLowerCase(), seriesNames);

      var missing,
          keys = Object.keys(data.key.data[0]);

      for(var i=0; i<seriesNames.length; i++) {
        if(!data.key.data[0][seriesNames[i]]) {
          missing = seriesNames[i];
          break;
        }
      }

      info.chart.set('chartData', data.key.data);
      this._deleteOneSerieFromConfig(info.chart, missing);
    },

    _changeData: function(info) {

      var data,
          seriesNames = Object.keys(info.chart.chartData[0]).filter(function(d, i) { return d[0] === 'y';});

      data = this._generateData(info.chart.chartData.length, Object.keys(info.chart.chartData[0]).length - 2, info.chart.nodeName.toLowerCase(), seriesNames);

      info.chart.set('chartData', data.key.data);
    },

    _changeDataAndSeries: function(info) {
      var numberOfSeries = Object.keys(info.chart.chartData[0]).length - 2,
          seriesNames = [],
          currentNames = Object.keys(info.chart.chartData[0]).filter(function(d, i) { return d[0] === 'y'}),
        data;


      for(var i=0; i< currentNames.length; i++) {
        seriesNames.push(this._generateSeriesName());
      }

      data = this._generateData(info.chart.chartData.length, numberOfSeries, info.chart.nodeName.toLowerCase(), seriesNames);

      info.chart.set('chartData', data.key.data);

      if(info.chart.nodeName.toLowerCase() === 'px-vis-timeseries' ||
          info.chart.nodeName.toLowerCase() === 'px-vis-xy-chart' ||
          info.chart.nodeName.toLowerCase() === 'px-vis-polar') {

        //find the series names: y +  a random number
        var newConf = {};

        for(var i=0; i<numberOfSeries ;i++) {

          if(info.chart.nodeName.toLowerCase() === 'px-vis-polar') {
            newConf[seriesNames[i]] = {
              'x': 'x',
              'y': seriesNames[i],
              'yAxisUnit': 'u'
            };
          } else {
            newConf[seriesNames[i]] = this._generateSeriesConfigXYTS(seriesNames[i].slice(1), false, info.chart.nodeName.toLowerCase() === 'px-vis-timeseries', info.chart);
          }
        }

        info.chart.set('seriesConfig', newConf);
      } else if(info.chart.nodeName.toLowerCase() === 'px-vis-parallel-coordinates' ||           info.chart.nodeName.toLowerCase() === 'px-vis-radar') {

    //    info.chart.push('axes', `y${numberOfSeries}`);
        //todo:expose a metho on the info.chart to redraw
        info.chart._computeAxes();
      }
    },

    _removeSerie: function(info) {

      var currentNames = Object.keys(info.chart.chartData[0]).filter(function(d, i) { return d[0] === 'y'}),
          seriesName = currentNames[currentNames.length-1];

      this._deleteOneSeriesData(info.chart.chartData, seriesName);
      this._deleteOneSerieFromConfig(info.chart, seriesName);
    },

    _deleteOneSerieFromConfig: function(chart, seriesName) {
      if(chart.nodeName.toLowerCase() === 'px-vis-timeseries' ||
          chart.nodeName.toLowerCase() === 'px-vis-xy-chart' ||
          chart.nodeName.toLowerCase() === 'px-vis-polar') {
        var newConf = {},
            confKeys = Object.keys(chart.seriesConfig);

        //copy current conf to bypass dirty check
        for(var i=0; i<confKeys.length; i++) {
          if(seriesName !== confKeys[i]) {
            newConf[confKeys[i]] = chart.seriesConfig[confKeys[i]];
          }
        }

        chart.set('seriesConfig', newConf);
      } else if(chart.nodeName.toLowerCase() === 'px-vis-parallel-coordinates' || chart.nodeName.toLowerCase() === 'px-vis-radar') {

    //    chart.push('axes', `y${numberOfSeries}`);
        //todo:expose a metho on the chart to redraw
        chart._computeAxes();
      }
    },

    _addOneSerieFromConfig: function(chart, numberOfSeries, seriesName) {
      //add serie
      if(chart.nodeName.toLowerCase() === 'px-vis-timeseries' ||
          chart.nodeName.toLowerCase() === 'px-vis-xy-chart'  ||
          chart.nodeName.toLowerCase() === 'px-vis-polar') {
        var newConf = {},
            confKeys = Object.keys(chart.seriesConfig),
            isTS = chart.nodeName.toLowerCase() === 'px-vis-timeseries';

        //copy current conf to bypass dirty check
        for(var i=0; i<confKeys.length; i++) {
          newConf[confKeys[i]] = chart.seriesConfig[confKeys[i]];
        }

        if(chart.nodeName.toLowerCase() === 'px-vis-polar') {
          newConf[seriesName] = {
            'x': 'x',
            'y': seriesName,
            'yAxisUnit': 'u'
          };
        } else {
          newConf[seriesName] = this._generateSeriesConfigXYTS(seriesName.slice(1), false, isTS, chart);
        }

        chart.set('seriesConfig', newConf);
      } else if(chart.nodeName.toLowerCase() === 'px-vis-parallel-coordinates' || chart.nodeName.toLowerCase() === 'px-vis-radar') {

    //    chart.push('axes', `y${numberOfSeries}`);
        //todo:expose a metho on the chart to redraw
        chart._computeAxes();
      }
    },

    _addSerie: function(info) {

      //add the data
      var numberOfSeries = Object.keys(info.chart.chartData[0]).length - 2,
          seriesName  = this._generateSeriesName();
      this._addOneSeriesData(info.chart.chartData, seriesName);
      this._addOneSerieFromConfig(info.chart, numberOfSeries, seriesName);
    },

    _addOneSeriesData: function(data, seriesName) {
      var number = Object.keys(data[0]).length - 2;
      for(var i=0; i<data.length; i++) {

        if(i===0) {

            data[i][seriesName] = Math.random() * (this._generateOptions.dataMax - this._generateOptions.dataMin) + this._generateOptions.dataMin;

        } else {
          //contain change within 10% of previous value
          data[i][seriesName] = data[i-1][seriesName] + (Math.random() * 2 -1) * this._generateOptions.variance;
        }
      }
    },

    _deleteOneSeriesData: function(data, seriesName) {
      var number = Object.keys(data[0]).length - 3;
      for(var i=0; i<data.length; i++) {

        delete data[i][seriesName];
      }
    },

    _removeChart: function() {
      var wrappers = Polymer.dom(this.root).querySelectorAll('.creationBatchDiv'),
          lastWrap = wrappers[wrappers.length - 1],
          chart;

      if(lastWrap) {

        if(this.$.reuse.checked) {
          //store used charts for later
          for(var i=0; i<lastWrap.children.length; i++) {
            chart = lastWrap.children[i].children[0];
            this.chartPool[chart.nodeName.toLowerCase()].push(chart);
          }
        }

        Polymer.dom(this.$.chartHolder).removeChild(lastWrap);
      }
    },

    _moveChart: function() {
      var wrappers = Polymer.dom(this.root).querySelectorAll('.divwrapper'),
          lastWrap = wrappers[wrappers.length - 1];

      if(lastWrap) {


        Polymer.dom(this.$.chartHolder).removeChild(lastWrap);

        setTimeout(function() {
          this._startPerfMeasure();
          Polymer.dom(this.$.chartHolder).appendChild(lastWrap);
        }.bind(this),500);

      }
    },




  });
})();
