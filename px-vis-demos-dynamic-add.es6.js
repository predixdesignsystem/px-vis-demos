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
              'addDynamicMenus': false,
              'addThresholds': false,
              'multiAxis': false,
              'rendToSvg': false,
              'resizeDebounce': 250,
              'width': 800,
              'height': 500,
              'preventResize': false,
              'customToolbar': false,
              'hideRegister': false,
              'includeChartExtents': false,
              'addEvents': false,
              'eventsNumber': 4,
              'eventsType': 'unicode',
              'eventsNoLine': false,
              'eventsNoTooltip': false,
              'markerSize': 64,
              'markerSymbol': 'circle',
              'markerScale': 1,
              'markerFillOpacity': 0.6,
              'markerStrokeOpacity': 1,
              'preventWwSync': false,
              'addCategories': false,
              'hideCategoryRegister': false,
              'markerTSNumber': 50,
              'markerTSRowsNumber': 3,
              'markerTSSize': 64,
              'markerTSSymbol': 'bar',
              'markerTSScale': 1,
              'markerTSFillOpacity': 0.6,
              'markerTSStrokeOpacity': 1,
              'markerShowTooltip': true,
              'hardMute': false,
              'showTooltip': false,
              'allowNegativeValues': false,
              'addCrosshairData': false
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
        _drawingMultiplier: {
          type: Number,
          value: 1
        },
        _drawingNumberOfCharts: {
          type: Number,
          value:0
        },
        _drawingTimerName: {
          type: String
        },
        _test: {
          type: Number,
          value: 99999
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
      this.addEventListener('px-vis-chart-canvas-rendering-ended', this._drawingListener);
    }

    detached() {
      this.$.generate.removeEventListener('click', this._generateListener);
      this.$.btnCreate.removeEventListener('click', this._createListener);
      this.$.btnRemove.removeEventListener('click', this._removeListener);
      this.$.btnMove.removeEventListener('click', this._moveListener);
      this.removeEventListener('px-vis-scatter-rendering-ended', this._drawingListener);
      this.removeEventListener('px-vis-line-svg-rendering-ended', this._drawingListener);
      this.removeEventListener('px-vis-chart-canvas-rendering-ended', this._drawingListener);
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

    _generateData(pointsNumber, seriesNumber, chartType, seriesNames) {


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
            newData['x'] = isPolar ? Math.random() * 360 : Math.random() * (this._generateOptions.dataMax - this._generateOptions.dataMin) + this._generateOptions.dataMin;
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
    }

    _computeCurrentDataSets() {

      this.set('_currentDataSets', this.dataSets[this.selectedChartType].slice());

      //select last item
      if(this.dataSets[this.selectedChartType] && this.dataSets[this.selectedChartType].length) {
        this.$.dataSetDropdown.set('displayValue', this.dataSets[this.selectedChartType][this.dataSets[this.selectedChartType].length-1].val);
        this.$.dataSetDropdown.set('selectedKey', this.dataSets[this.selectedChartType][this.dataSets[this.selectedChartType].length-1].key);
      }
    }

    _canScatter(selectedChartType) {
      return selectedChartType !== 'px-vis-parallel-coordinates' && selectedChartType !== 'px-vis-radar' && selectedChartType !== 'px-vis-pie-chart' && selectedChartType !== 'px-vis-polar';
    }

    _canCanvas(selectedChartType) {
      return selectedChartType === 'px-vis-timeseries' || selectedChartType === 'px-vis-xy-chart' || selectedChartType === 'px-vis-polar';
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

    _isPolar(selectedChartType) {
      return selectedChartType === 'px-vis-polar';
    }

    _canMultiY(selectedChartType) {
      return selectedChartType === 'px-vis-timeseries' || selectedChartType === 'px-vis-xy-chart';
    }

    _canChartExtents(selectedChartType) {
      return selectedChartType !== 'px-vis-parallel-coordinates' && selectedChartType !== 'px-vis-polar';
    }

    _canWebWorker(selectedChartType) {
      return selectedChartType !== 'px-vis-parallel-coordinates' && selectedChartType !== 'px-vis-radar';
    }

    _createChart() {

      var data = this.$.dataSetDropdown.selectedKey.data,
          extents = this.$.dataSetDropdown.selectedKey.extents;

      if(this.$.dataSetDropdown.selectedKey === 'dummy') {
        console.log(`No data selected, please generate data for ${this.selectedChartType}`);
        return;
      }

      if(data) {
        this._drawingCounter = 0;
        this._drawingsPerChart = this._getNumberOfDrawingPerCharts(data);
        this._drawingNumberOfCharts = this.$.chartNumber.value;
        this._drawingTimerName = `draw ${this._drawingNumberOfCharts} ${this.selectedChartType}`;

        if(this.selectedChartType === 'px-vis-timeseries' || this.selectedChartType === 'px-vis-xy-chart' || this.selectedChartType === 'px-vis-polar') {
          if(this._chartOptions.canvas) {
            this._drawingMultiplier = this.selectedChartType === 'px-vis-timeseries' && !this._chartOptions.disableNav ? 2 : 1;
          } else {
            this._drawingMultiplier = this._drawingsPerChart;
          }
        } else {
          if(this._chartOptions.rendToSvg) {
            this._drawingMultiplier = 1;
          } else {
            this._drawingMultiplier = this._drawingsPerChart;
          }
        }

        var newDiv = document.createElement('div'),
                newChart,
                currWidth = this.$.chartHolder.getBoundingClientRect().width;

        newDiv.classList.add('divwrapper');

        //finally append all charts in our element
        Polymer.dom(this.$.chartHolder).appendChild(newDiv);

        //create the requested number of charts
        for(var i=0;i <this._drawingNumberOfCharts; i++) {

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

          newChart.debounceResizeTiming = this._chartOptions.resizeDebounce;
          newChart.set('preventResize', this._chartOptions.preventResize);

          //process all chart options
          newChart.set('height', this._chartOptions.height);
          if(newChart.preventResize) {
            newChart.set('width', this._chartOptions.width);
          } else {
            newChart.width = currWidth;
          }
          this._processOptions(newChart, extents, data);
          newChart.chartData = data;
          newChart.hardMute = this._chartOptions.hardMute;
          newChart.showTooltip = this._chartOptions.showTooltip;

          if(this._chartOptions.addCrosshairData) {
            newChart.set('highlighterConfig',{'drawWithLocalCrosshairData': false, 'differentDataset': true, 'fuzz': 100000000000, 'showTooltipData': true});

            var timestamp = data[Math.floor(data.length/2)].timeStamp;
            newChart.set('crosshairData', {"rawData":[{"timeStamp":timestamp}],"timeStamps":[timestamp]});
          }

          if(this._chartOptions.customToolbar) {
            var newConf = {};

            newConf.config = {};
            if(newChart.toolbarConfig) {

              var keys = Object.keys(newChart.toolbarConfig.config);
              for(var j=0; j<keys.length; j++) {
                newConf.config[keys[j]] = newChart.toolbarConfig.config[keys[j]];
              }
            }
            newConf.config.addSerie = {
              'tooltipLabel': 'Add a serie to the chart',
              'title': '+1',
              'onClick': this._addSerie,
              'onClickContext': this,
              'chart': newChart
            };
            newConf.config.removeSerie = {
              'tooltipLabel': 'Remove a serie from the chart',
              'title': '-1',
              'onClick': this._removeSerie,
              'onClickContext': this,
              'chart': newChart
            };
            newConf.config.modifyData = {
              'tooltipLabel': 'Changes the data for the current series',
              'title': '~',
              'onClick': this._changeData,
              'onClickContext': this,
              'chart': newChart
            };
            newConf.config.modifyDataAndSeries = {
              'tooltipLabel': 'Changes the data and the series',
              'title': '~~',
              'onClick': this._changeDataAndSeries,
              'onClickContext': this,
              'chart': newChart
            };
            newConf.config.addAndModify = {
              'tooltipLabel': 'Changes the data for the current series and add 1 series',
              'title': '+1/~',
              'onClick': this._addSerieAndModifyData,
              'onClickContext': this,
              'chart': newChart
            };
            newConf.config.removeAndModify = {
              'tooltipLabel': 'Changes the data for the current series and remove 1 series',
              'title': '-1/~',
              'onClick': this._removeSerieAndModifyData,
              'onClickContext': this,
              'chart': newChart
            };
            newChart.set('toolbarConfig', newConf);
          }

        }

        //append chart in div
        Polymer.dom(newDiv).appendChild(newChart);
        this._startPerfMeasure();

      } else {
        console.log('please select data');
      }
    }

    _generateSeriesName() {
      return `y${Math.floor(Math.random()*1000)}`;
    }

    _addSerieAndModifyData(info) {
      var numberOfSeries = Object.keys(info.chart.chartData[0]).length - 2,
          seriesNames = Object.keys(info.chart.chartData[0]).filter(function(d, i) { return d[0] === 'y';}),
          data,
          seriesName  = this._generateSeriesName();

      seriesNames.push(seriesName);

      data = this._generateData(info.chart.chartData.length, numberOfSeries + 1, info.chart.nodeName.toLowerCase(), seriesNames);

      info.chart.set('chartData', data.key.data);

      this._addOneSerieFromConfig(info.chart, numberOfSeries, seriesName);
    }

    _removeSerieAndModifyData(info) {
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
    }

    _changeData(info) {

      var data,
          seriesNames = Object.keys(info.chart.chartData[0]).filter(function(d, i) { return d[0] === 'y';});

      data = this._generateData(info.chart.chartData.length, Object.keys(info.chart.chartData[0]).length - 2, info.chart.nodeName.toLowerCase(), seriesNames);

      info.chart.set('chartData', data.key.data);
    }

    _changeDataAndSeries(info) {
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
    }

    _removeSerie(info) {

      var currentNames = Object.keys(info.chart.chartData[0]).filter(function(d, i) { return d[0] === 'y'}),
          seriesName = currentNames[currentNames.length-1];

      this._deleteOneSeriesData(info.chart.chartData, seriesName);
      this._deleteOneSerieFromConfig(info.chart, seriesName);
    }

    _deleteOneSerieFromConfig(chart, seriesName) {
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
    }

    _addOneSerieFromConfig(chart, numberOfSeries, seriesName) {
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
    }

    _addSerie(info) {

      //add the data
      var numberOfSeries = Object.keys(info.chart.chartData[0]).length - 2,
          seriesName  = this._generateSeriesName();
      this._addOneSeriesData(info.chart.chartData, seriesName);
      this._addOneSerieFromConfig(info.chart, numberOfSeries, seriesName);
    }

    _addOneSeriesData(data, seriesName) {
      var number = Object.keys(data[0]).length - 2;
      for(var i=0; i<data.length; i++) {

        if(i===0) {

            data[i][seriesName] = Math.random() * (this._generateOptions.dataMax - this._generateOptions.dataMin) + this._generateOptions.dataMin;

        } else {
          //contain change within 10% of previous value
          data[i][seriesName] = data[i-1][seriesName] + (Math.random() * 2 -1) * this._generateOptions.variance;
        }
      }
    }

    _deleteOneSeriesData(data, seriesName) {
      var number = Object.keys(data[0]).length - 3;
      for(var i=0; i<data.length; i++) {

        delete data[i][seriesName];
      }
    }

    _generateSeriesConfigXYTS(numberId, useGenerationConfig, isTS, chart) {
      var result = {},
          seriesNumber,
          isMultiAxis = useGenerationConfig ? this._chartOptions.multiAxis : (Object.keys(chart.y).length > 1),
          type;

      if(useGenerationConfig) {
        seriesNumber = (this._chartOptions.disableNav || !isTS) ? this._drawingsPerChart : this._drawingsPerChart/2;
        type = this._chartOptions.scatter ? 'scatter' : 'line';
      } else {
        var configKey = Object.keys(chart.seriesConfig);
        seriesNumber = (Object.keys(chart.chartData[0]).length -2);
        type = chart.seriesConfig[configKey[0]].type;
      }

      result = {
        'x': isTS ? 'timeStamp' : 'x',
        'y': `y${numberId}`,
        'type': type,
        'yAxisUnit': 'u',
        'xAxisUnit': 'u',
        'markerSize': this._chartOptions.markerSize,
        'markerSymbol': this._chartOptions.markerSymbol,
        'markerScale': this._chartOptions.markerScale,
        'markerFillOpacity': this._chartOptions.markerFillOpacity,
        'markerStrokeOpacity': this._chartOptions.markerStrokeOpacity,
      };

      if(isMultiAxis) {

        var side;
        if(useGenerationConfig) {
          side = numberId < seriesNumber/2 ? 'left' : 'right';
        } else {
          side = chart.numLeftAxes === chart.numRightAxes ? 'left' : 'right';
        }

        result.axis = {
          'id': `axis${numberId}`,
          'number': numberId,
          'side': side
        };
      }

      return result;
    }

    _removeChart() {
      var wrappers = Polymer.dom(this.root).querySelectorAll('.divwrapper'),
          lastWrap = wrappers[wrappers.length - 1];

      if(lastWrap) {

        if(this.$.reuse.checked) {
          //store used charts for later
          for(var i=0; i<lastWrap.children.length; i++) {
            this.chartPool[lastWrap.children[i].nodeName.toLowerCase()].push(lastWrap.children[i]);
          }
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
          this._startPerfMeasure();
          Polymer.dom(this.$.chartHolder).appendChild(lastWrap);
        }.bind(this),500);

      }
    }

    _startPerfMeasure() {
      window.performance.clearMarks();
      window.performance.mark('start');
    }

    _drawingListen() {
      this._drawingCounter++;

       if(this._drawingCounter%(this._drawingMultiplier*Number(this._drawingNumberOfCharts)) === 0) {
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
          return Object.keys(data[0]).length -2;
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

    _processOptions(chart, extents, data) {

      switch(this.selectedChartType) {
        case 'px-vis-timeseries':
          this._processOptionsTS(chart, extents, data);
          break;
        case 'px-vis-xy-chart':
          this._processOptionsXY(chart, extents);
          break;
        case 'px-vis-polar':
          this._processOptionsPolar(chart);
          break;
        case 'px-vis-parallel-coordinates':
          this._processOptionsParallel(chart);
          break;
        case 'px-vis-radar':
          this._processOptionsRadar(chart, extents);
          break;
        case 'px-vis-pie-chart':
          //TODO
      }
    }

    _processOptionsTS(chart, extents, data) {

      var seriesConfig = {},
          seriesNumber = this._chartOptions.disableNav ? this._drawingsPerChart : this._drawingsPerChart/2;

      for(var i=0; i<seriesNumber; i++) {
          seriesConfig[`y${i}`] = this._generateSeriesConfigXYTS(i, true, true);
      }

      chart.set('seriesConfig', seriesConfig);
      chart.set('renderToCanvas', this._chartOptions.canvas);
      chart.toolbarConfig = {'config': {
        'advancedZoom': true,
        'pan': true
      }};

      chart.hideRegister = this._chartOptions.hideRegister;

      if(this._chartOptions.includeChartExtents) {
        chart.chartExtents = extents;
      } else {
        chart.chartExtents = {
          "x": ["dynamic", "dynamic"],
          "y": ["dynamic","dynamic"]
        };
      }

      chart.xAxisConfig = {"title": "X",
            "labelPosition": "center",
            "orientation": "bottom"};
      chart.yAxisConfig = {"title": "An Axis"};
      if(!this._chartOptions.multiAxis) {
        chart.yAxisConfig.preventSeriesBar = true;
      }

      if(this._chartOptions.addEvents) {

        var step = (data[data.length - 1].timeStamp - data[0].timeStamp) / this._chartOptions.eventsNumber,
            eventData = [];

        for(var i=0; i<this._chartOptions.eventsNumber; i++) {
          eventData.push({
            'id': i,
            'time': data[0].timeStamp + step*(i+0.5),
            'label': this._chartOptions.eventsType
          });
        }

        chart.eventData = eventData;
        chart.eventConfig = {
          "fa":{
            "color": "blue",
            "icon": "px-fea:deployments",
            "type": "px",
            "offset":[0,0],
            "lineColor": "red",
            "lineWeight": this._chartOptions.eventsNoLine ? 0 : 1,
            'enableTooltip': this._chartOptions.eventsNoTooltip ? false : true
          },
          "unicode":{
            "color": "green",
            "icon": "px-obj:truck",
            "type": "px",
            "offset":[1,0],
            "lineWeight": this._chartOptions.eventsNoLine ? 0 : 1,
            'enableTooltip': this._chartOptions.eventsNoTooltip ? false : true
          },
          "default":{
            "lineWeight": this._chartOptions.eventsNoLine ? 0 : 1,
            'enableTooltip': this._chartOptions.eventsNoTooltip ? false : true
          }
        };
      } else {
        //make sure we clean it
        chart.eventData = [];
        chart.eventConfig = {};
      }

      if(this._chartOptions.addMarkers) {

        var step = (data[data.length - 1].timeStamp - data[0].timeStamp) / this._chartOptions.markerTSNumber,
            markerData = [],
            config = {},
            newMargin = {};

        newMargin.top = chart.margin.top;
        newMargin.bottom = chart.margin.bottom + 50;
        newMargin.left = chart.margin.left;
        newMargin.right = chart.margin.right;


        for(var j=0; j<this._chartOptions.markerTSRowsNumber; j++) {

          //add data for this row
          for(var i=0; i<this._chartOptions.markerTSNumber; i++) {
            markerData.push({
              'time': Math.floor(data[0].timeStamp + step*(i+0.5)),
              'label': `label${j}`,
              'customKey': 'someVal',
              'customKey2': 1223124
            });

            //add "triple timestamp" marker on first row
            if(j===0) {
              markerData.push({
                'time': Math.floor(data[0].timeStamp + step*(i+0.5)),
                'label': `labelCustom`,
                'customKey': 'someOtherVal',
                'customKey2': 1
              });

              markerData.push({
                'time': Math.floor(data[0].timeStamp + step*(i+0.5)),
                'label': `labelCustom2`,
                'customKey': 'pwet',
                'customKey2': 323
              });
            }
          }


          //add config for this row
          config[`label${j}`] = {
            "color": "rgb(123,0,0)",
            'location': j%2 === 0 ? 'top': 'bottom',
            'row': j,
            'markerSize': this._chartOptions.markerTSSize,
            'markerSymbol': this._chartOptions.markerTSSymbol,
            'markerScale': this._chartOptions.markerTSScale,
            'markerFillOpacity': this._chartOptions.markerTSFillOpacity,
            'markerStrokeOpacity': this._chartOptions.markerTSStrokeOpacity,
            'showTooltip': this._chartOptions.markerShowTooltip,
            'priority':10,
            'firstDateTimeFormat': 'HH:mm A z',
            'timezone': 'Etc/GMT'
          };

          if(j%2 === 0) {
            newMargin.top += 15;
          } else {
            newMargin.bottom += 15;
          }
        }

        config[`labelCustom`] = {
          "color": "rgb(123,123,123)",
          'location':'top',
          'row': 0,
          'markerSize': this._chartOptions.markerTSSize,
          'markerSymbol': 'star',
          'markerScale': this._chartOptions.markerTSScale,
          'markerFillOpacity': this._chartOptions.markerTSFillOpacity,
          'markerStrokeOpacity': this._chartOptions.markerTSStrokeOpacity,
          'showTooltip': this._chartOptions.markerShowTooltip,
          'priority': 1,
          'firstDateTimeFormat': 'HH:mm A z',
          'timezone': 'Etc/GMT+10'
        };

        config[`labelCustom2`] = {
          "color": "rgb(0,255,0)",
          'location':'top',
          'row': 0,
          'markerSize': this._chartOptions.markerTSSize,
          'markerSymbol': 'wye',
          'markerScale': this._chartOptions.markerTSScale,
          'markerFillOpacity': this._chartOptions.markerTSFillOpacity,
          'markerStrokeOpacity': this._chartOptions.markerTSStrokeOpacity,
          'showTooltip': this._chartOptions.markerShowTooltip,
          'priority': 2,
          'firstDateTimeFormat': 'HH:mm A z',
          'timezone': 'Etc/GMT+10'
        };

        chart.set('margin', newMargin);

        chart.markerData = markerData;
        chart.markerConfig = config;
      } else {
        //make sure we clean it
        chart.markerData = [];
        chart.markerConfig = {};
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
              'action': 'function(data) {var newConf = {}, confKeys = Object.keys(this.seriesConfig); for(var i=0; i<confKeys.length; i++) { if(data.additionalDetail.name !== confKeys[i]) {newConf[confKeys[i]] = this.seriesConfig[confKeys[i]];}}this.set("seriesConfig", newConf);}',
              "eventName": "delete",
              "icon": "px-vis:trash-series"
            },
            {
              "name": "Bring To Front",
              "action": "function(data) { this.set(\"serieToRedrawOnTop\", data.additionalDetail.name);}",
              "eventName": "bring-to-front",
              "icon": "px-vis:bring-to-front"
            }
          ];
      } else {
        chart.dynamicMenuConfig = [];
      }

      chart.disableNavigator = this._chartOptions.disableNav;
      chart.preventWebWorkerSynchronization = this._chartOptions.preventWwSync;

    }

    _processOptionsXY(chart, extents) {

      var seriesConfig = {};
      for(var i=0; i<this._drawingsPerChart; i++) {
          seriesConfig[`y${i}`] = this._generateSeriesConfigXYTS(i, true, false);
      }

      chart.hideRegister = this._chartOptions.hideRegister;
      chart.registerConfig = {
        'forceDateTimeDisplay': 'true',
        'width': 250
      };
      chart.toolbarConfig = {'config': {
        'advancedZoom': true,
        'pan': true
      }};
      chart.xAxisConfig = {"title": "X",
            "labelPosition": "center",
            "orientation": "bottom"};
      chart.yAxisConfig = {"title": "An Axis"};
      if(!this._chartOptions.multiAxis) {
        chart.yAxisConfig.preventSeriesBar = true;
      }
      chart.seriesConfig = seriesConfig;
      chart.margin={ "top": "30", "bottom": "60", "left": "80", "right": "100" };
      chart.timeData = 'timeStamp';

      if(this._chartOptions.includeChartExtents) {
        chart.chartExtents = extents;
      } else {
        chart.chartExtents = {
          "x": ["dynamic", "dynamic"],
          "y": ["dynamic","dynamic"]
        };
      }

      chart.renderToCanvas = this._chartOptions.canvas;

      if(this._chartOptions.addDynamicMenus) {
        chart.dynamicMenuConfig = [{
              "name": "Delete",
              "action": "function(data) { var conf = this.seriesConfig;  delete conf[data.additionalDetail.name]; this.set(\"seriesConfig\", {}); this.set(\"seriesConfig\", conf);}",
              "eventName": "delete",
              "icon": "px-vis:trash-series"
            },
            {
              "name": "Bring To Front",
              "action": "function(data) { this.set(\"serieToRedrawOnTop\", data.additionalDetail.name);}",
              "eventName": "bring-to-front",
              "icon": "px-vis:bring-to-front"
            }
          ];
      } else {
        chart.dynamicMenuConfig = [];
      }
      chart.preventWebWorkerSynchronization = this._chartOptions.preventWwSync;
    }

    _processOptionsPolar(chart) {
       var seriesConfig = {};
      for(var i=0; i<this._drawingsPerChart; i++) {

        seriesConfig[`y${i}`] = {
          'x': 'x',
          'y': `y${i}`,
          'yAxisUnit': 'someUnit'
        };
      }
      chart.hideRegister = this._chartOptions.hideRegister;
      chart.allowNegativeValues = this._chartOptions.allowNegativeValues;
      chart.registerConfig = {
        'forceDateTimeDisplay': 'true',
        'width': 250
      };
      chart.toolbarConfig = {
        'config': {
          'crosshairWithOptions': true
        }
      };

      chart.seriesConfig = seriesConfig;
      chart.useDegrees = true;
      chart.margin={ "top": "0", "bottom": "0", "left": "10", "right": "10" };
      chart.timeData = 'timeStamp';

      chart.renderToCanvas = this._chartOptions.canvas;

      if(this._chartOptions.addDynamicMenus) {
        chart.dynamicMenuConfig = [{
              "name": "Dummy",
              "action": "function(data) { console.log(\"dummy\")}",
              "eventName": "delete",
              "icon": "px-vis:trash-series"
            }
          ];
      } else {
        chart.dynamicMenuConfig = [];
      }
      chart.preventWebWorkerSynchronization = this._chartOptions.preventWwSync;
    }

    _processOptionsParallel(chart) {

      chart.generateAxesFromData = true;
      chart.matchTicks = true;
      chart.seriesKey = 'timeStamp';
      chart.skipKeys = {"x":true, "timeStamp": true, "category": true};
      chart.renderToSvg = this._chartOptions.rendToSvg;
      chart.hideAxisRegister = this._chartOptions.hideRegister;
      chart.hideCategoryRegister = this._chartOptions.hideCategoryRegister;
      chart.categoryKey = this._chartOptions.addCategories ? 'category' : '';
      chart.categories = [0,1,2,3];

      if(this._chartOptions.addDynamicMenus) {
        chart.dynamicMenuConfig = [{
              "name": "Dummy",
              "action": "function(data) { console.log(\"dummy\")}",
              "eventName": "delete",
              "icon": "px-vis:trash-series"
            }
          ];
      } else {
        chart.dynamicMenuConfig = [];
      }

    }

    _processOptionsRadar(chart, extents) {

      chart.generateAxesFromData = true;
      chart.matchTicks = true;
      chart.seriesKey = 'timeStamp';
      chart.skipKeys = {"x":true, "timeStamp": true};
      chart.renderToSvg = this._chartOptions.rendToSvg;
      chart.hideAxisRegister = this._chartOptions.hideRegister;
      chart.hideCategoryRegister = this._chartOptions.hideCategoryRegister;
      chart.categoryKey = this._chartOptions.addCategories ? 'category' : '';
      chart.categories = [0,1,2,3];

      if(this._chartOptions.includeChartExtents) {
        chart.chartExtents = extents;
      }

      if(this._chartOptions.addDynamicMenus) {
        chart.dynamicMenuConfig = [{
              "name": "Dummy",
              "action": "function(data) { console.log(\"dummy\")}",
              "eventName": "delete",
              "icon": "px-vis:trash-series"
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
