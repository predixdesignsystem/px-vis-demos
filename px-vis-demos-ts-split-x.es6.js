/**
 * @license
 * Copyright (c) 2018, General Electric
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
  Polymer({

    is: 'px-vis-demos-ts-split-x',

    properties: {
      chartData:{
        type: Object
      },

      seriesConfig: {
        type: Object
      },

      defaultSeriesConfig: {
        type: Object
      },

      splitEnabled: {
        type: Boolean,
        value: false
      },

      actionConfig: {
        type: Object
      },

      tooltipData: {
        type: Object
      },

      fakeTooltipData: {
        type: Object,
        computed: '_fakeTooltipData(tooltipData)'
      },

      splitConfig: {
        type: Object,
        value: function() {
          return {
            'config': {
              'advancedZoom': true,
              'pan': true,
              'tooltip': true,
              'splitZoom': {
                'icon': 'px-utl:zoom',
                'buttonGroup': 5,
                'tooltipLabel': 'Split zoom',
                'selectable': true,
                'actionConfig': {
                  'mousedown': this.splitZoomStart.bind(this),
                  'mouseup': this.splitZoomEnd.bind(this),
                  'mousemove': this.splitZoomMove.bind(this)
                }
              }
            }
          };
        }
      },

      dismissConfig: {
        type: Object,
        value: function() {
          return {
            'config': {
              'advancedZoom': true,
              'pan': true,
              'tooltip': true,
              'dismiss': {
                'icon': 'px-nav:close',
                'tooltipLabel': 'close split zoom view',
                'onClick': this.closeSplitZoom.bind(this)
              }
            }
          };
        }
      },

      zoomState: {
        type: Object,
        value: function() {
          return {
            'isZooming': false,
            'domains': [],
            'domainsIndex': -1
          };
        }
      },

      rects: {
        type: Array,
        value: function() {
          return [];
        }
      },

      oldExtents: {
        type: Object
      }
    },

    attached: function() {
      this.$.main.set('toolbarConfig', this.splitConfig);
    },

    /**
     * Checks if a theme variable exists, if so, returns the theme value, if not, returns the default
     */
    _checkThemeVariable: function(varName, defaultValue) {
      var themeVar = this.getComputedStyleValue(varName);
      return (!themeVar || themeVar.length === 0) ? defaultValue : themeVar;
    },

    splitZoomStart: function(evt) {

      //store start time for this zoom
      this.zoomState.isZooming = true;
      this.zoomState.domains.push([this.$.main.x.invert(evt.mouseCoords[0])]);
      this.zoomState.domainsIndex++;

      //start drawing box

      //in case the user clicks inside the chart, and mouses out, we are waiting for a mouseup, and closing our action box with the coordinates available on the mouseup.
      Px.d3.select(document).on('mouseup.action', this.splitZoomEnd.bind(this));

      var startX = evt.mouseCoords[0],
          startY = 0;

      //appends to the chart svg
      this.rects.push(this.$.main.svgLower.append('rect')
        .attr('class', 'action-area')
        .attr('x', startX)
        .attr('y', startY)
        .attr('ox', startX) // save this original position for calcs
        .attr('rx', 2)
        .attr('width', 0)
        .attr('height', evt.target.getAttribute('height'))
        .attr('fill', this._checkThemeVariable('--px-vis-zoom-brush-fill-color', 'rgb(0,0,0)'))
        .attr('fill-opacity', this._checkThemeVariable('--px-vis-zoom-brush-fill-opacity', 0.5))
        .attr('stroke', this._checkThemeVariable('--px-vis-zoom-brush-outline-color', 'rgb(0,0,0)')));
    },

    splitZoomEnd: function(evt) {

      this.zoomState.isZooming = false;

      //since we are done drawing our action box, remove the listener from document using d3.
      Px.d3.select(document).on('mouseup.action', null);

      //sort start/end date
      if(this.zoomState.domains[this.zoomState.domains.length-1]) {
        this.zoomState.domains[this.zoomState.domains.length-1].sort(function(a, b) { return a - b;});
      }

      if (this.zoomState.domains.length === 2) {
        this.applySplitZoom();

        //clear rectangles
        for(var i=0; i<this.rects.length; i++) {
          if(this.rects[i] && this.rects[i].remove) {
            this.rects[i].remove();
          }
        }
        this.rects = [];
      }
    },

    splitZoomMove: function(evt) {

      if(this.zoomState.isZooming) {
        //update drawing box

        var ox = parseInt(this.rects[this.zoomState.domainsIndex].attr('ox')),
            newX = Math.max(Math.min(evt.mouseCoords[0], 1000), 0);

        // if current position is greater than the original position
        if(newX >= ox) {
          // set x to the original position to prevent some drift on crossover. width is equal to the difference between the x and current mouse position
          this.rects[this.zoomState.domainsIndex].attr('x', ox);
          this.rects[this.zoomState.domainsIndex].attr('width', newX - ox);
        } else {
          // else, the x is the current pos (because we cant have negative width) and width is the difference
          this.rects[this.zoomState.domainsIndex].attr('x', newX);
          this.rects[this.zoomState.domainsIndex].attr('width', ox - newX);
        }

        //update end time
        this.zoomState.domains[this.zoomState.domains.length-1][1] = this.$.main.x.invert(evt.mouseCoords[0]);
      }
    },

    closeSplitZoom: function(evt) {
      this.$.main.classList.remove('half');
      this.set('splitEnabled', false);
      this.$.main.set('toolbarConfig', this.splitConfig);
      this.$.main.set('hideRegister', false);
      this.$.main.set('chartExtents', {x: this.oldExtents});
      this.zoomState = {
        'isZooming': false,
        'domains': [],
        'domainsIndex': -1
      };
      var oldDebounceTiming = this.$.main.debounceResizeTiming;
      this.$.main.debounceResizeTiming = 0;
      this.$.main.notifyResize();
      this.$.main.debounceResizeTiming = oldDebounceTiming;
    },

    applySplitZoom: function() {

      this.splitZooming = false;
      console.log('stop split');
      this.set('splitEnabled', true);
      this.$.main.classList.add('half');

      //if it hasn't been used yet force stamping and remember it
      if(!this.$.sub) {
        this.$.subIf.render();
        this.$.sub = this.$$('#sub');
      }

      //ensure domains are sorted based on time
      if(this.zoomState.domains[0][0] > this.zoomState.domains[1][0]) {
        var tmp = this.zoomState.domains.shift();
        this.zoomState.domains.push(tmp);
      }

      //update extents
      this.oldExtents = this.$.main.x.domain();
      this.$.main.set('chartExtents', {x:this.zoomState.domains[0]});
      this.$.sub.set('chartExtents', {x:this.zoomState.domains[1]});

      //cosmetic stuff
      this.$.main.set('toolbarConfig', this.dismissConfig);
      this.$.main.set('hideRegister', true);
      this.$.main.debounceResizeTiming = 0;
      this.$.sub.debounceResizeTiming = 0;
      this.$.main.notifyResize();
      this.$.sub.notifyResize();
      this.$.main.debounceResizeTiming = 250;
      this.$.sub.debounceResizeTiming = 250;
    },

    _getMainClass: function(splitEnabled) {
      return splitEnabled ? 'flex__item half' : 'flex__item full';
    },

    _fakeTooltipData: function(tooltipData) {
      var result = {
        series: []
      };

      for(var i=0; i<tooltipData.series.length; i++) {
        result.series.push({
          'name': tooltipData.series[i].name,
          'value': tooltipData.series[i].value,
          'coord': [-999, -999]
        });
      }
      result.time = tooltipData.time;

      return result;
    }
  });
})();
