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

    is: 'px-vis-demos-annotation',

    properties: {

      //the current chart we are creating an annotation on
      currentChart: {
        type: Object
      },

      isRadarParallel: {
        type: Boolean,
        value: false
      },

      //assocaited series with the annotation that will be created
      _seriesFound: {
        type: String
      },

      //chart values assocaited with the annotation that will be created
      annotationValue: {
        type: Array
      },

      //array containing all charts on page
      allCharts: {
        type: Array
      },

      //annotation text entered by the user
      annotationText: {
        type: String,
        value: ''
      },

      //whether the tooltip is locked in place for editing
      _lockTooltip: {
        type: Boolean,
        value: false
      },

      //current annotation being edited
      _currentDataEdit: {
        type: Object
      },

      //cancel save delete
      _editAction: {
        type: String,
        value: 'cancel'
      },

      //whether the displayed annotation should be in edit mode
      editMode: {
        type: Boolean,
        value: false
      },

      //human readable values for annotation X and Y values
      _readableValues: {
        type: String,
        computed: '_computeReadableValue(annotationValue, currentChart)'
      }
    },

    attached: function() {

      this.allCharts = [];
      this.allCharts.push(this.$.timeseries);
      this.allCharts.push(this.$.xy);
      this.allCharts.push(this.$.polar);
      this.allCharts.push(this.$.radar);
      this.allCharts.push(this.$.para);

      this.allCharts.forEach(function(element) {
        element.addEventListener('px-vis-annotation-creation', this.createAnnotation.bind(this));
        element.addEventListener('px-vis-annotation-enter', this.showAnnotation.bind(this));
        element.addEventListener('px-vis-annotation-leave', this.hideAnnotation.bind(this));
        element.addEventListener('px-vis-annotation-click', this.editAnnotation.bind(this));

        //lazy copying...
        var old = JSON.parse(JSON.stringify(element.toolbarConfig));
        old.config.customAnnotations =
          {
            'tooltipLabel': 'Annotations',
            'icon': 'px-vis:comment',
            'cursorIcon': 'px-vis:comment',
            'buttonGroup': 1,
            'onClick': function () {
              this.set('_internalShowTooltip', false);
              this.set('showStrongIcon', true);
              this.set('interactionSpaceConfig.searchType', 'closestPoint');
              this.set('interactionSpaceConfig.searchFor', 'point');
            },
            'onDeselect': function () {
              this.set('showStrongIcon', false);
              this.set('interactionSpaceConfig.searchFor', 'timestamp');
            },
            'actionConfig': {
              'mouseout': 'resetTooltip',
              'mousemove': 'calcTooltipData',
              'mousedown': 'null',
              'click': function (evt) {
                this.fire('px-vis-event-request', { 'eventName': 'px-vis-annotation-creation', 'data': { 'mouseCoords': evt.mouseCoords, 'clickTarget': evt.target, 'chart': this } })
              },
              'mouseup': 'null'
            },
            'subConfig': {
              'hideAnnotations': {
                'tooltipLabel': 'Hide Annotations',
                'icon': 'px-vis:hide',
                'buttonGroup': 1,
                'toggle': true,
                'onClick': 'function(button) {this.$$("px-vis-annotations").set("hide", button.selected);}'
              }
            }
          };
          element.set('toolbarConfig', old);
      }, this);

      this.$.modal.addEventListener('px-modal-accepted', this.modalClose.bind(this));

      this.$.tooltip.addEventListener('px-tooltip-hide', this._tooltipHide.bind(this));
      this.$.ttContent.addEventListener('tooltip-content-save', this._saveEdit.bind(this));
      this.$.ttContent.addEventListener('tooltip-content-delete', this._deleteEdit.bind(this));
      this.$.ttContent.addEventListener('tooltip-content-cancel', this._cancelEdit.bind(this));
    },

    createAnnotation: function(evt) {

      //store current chart for further use
      this.currentChart = evt.detail.data.chart;

      //get chart type
      this.isRadarParallel = this.currentChart.nodeName === 'PX-VIS-PARALLEL-COORDINATES' || this.currentChart.nodeName === 'PX-VIS-RADAR';

      var mousePos = evt.detail.data.mouseCoords;

      //find the series available
      if(this.isRadarParallel) {

        //we get our data through tooltip data single point search.
        //it will have only 1 series for parallel and radar
        this.set('_seriesFound', this.currentChart.tooltipData.series[0].name);

        //for those charts the values are: [axis, yValue]
        this.annotationValue = [this._seriesFound, this.currentChart.tooltipData.series[0].value[this._seriesFound]];

        //another example of getting sopme value: convert the mouse
        //position into actual value. The annotation will be placed
        //where the mouse is rather than on closest point
        //this.currentChart.getDataFromPixel(mousePos, this._seriesFound);
      } else {

        //example code for searching through 4 data points if tooltip
        //search were not using single point
        // var closest = this.currentChart.tooltipData.series[0].name,
        //     min = Number.MAX_VALUE,
        //     distance;

        // //we search for the closest point
        // this.currentChart.tooltipData.series.forEach(function(val) {

        //   //do square distance because we only care about comparing
        //   distance = Math.pow(val.coord[0] - mousePos[0], 2) + Math.pow(val.coord[1] - mousePos[1], 2);

        //   if(distance < min) {
        //     closest = {
        //       id: val.name,
        //       value: [val.value[this.currentChart.completeSeriesConfig[val.name].x], val.value[this.currentChart.completeSeriesConfig[val.name].y]]
        //     };
        //     min = distance;
        //   }
        // }.bind(this));

        //we get our data through tooltip data single point search. This
        //search returns all series but only 1 has value, so use this one
        var val;
        this.currentChart.tooltipData.series.forEach(function(elem) {
          if(Object.keys(elem.value).length > 0) {
            val = elem;
          }
        });

        this.set('_seriesFound', val.name);
        //here we use the value of the closest point we found. we could
        //also use the mouse position converted to value and keep track
        //of the closest point
        this.annotationValue = [val.value[this.currentChart.completeSeriesConfig[this._seriesFound].x], val.value[this.currentChart.completeSeriesConfig[this._seriesFound].y]];
      }

      //open the modal
      this.$.modal.set('opened', true);
    },

    showAnnotation: function(evt) {

      if(!this._lockTooltip) {

        this.$.ttContent.annotationMessage = evt.detail.data.annotationData.data.message;

        this.set('_ttTarget', evt.detail.data.icon);
        this.$.tooltip.set('opened', true);
      }
    },

    hideAnnotation: function(evt) {
      if(!this._lockTooltip) {
        this.$.tooltip.set('opened', false);
      }
    },

    editAnnotation: function(evt) {
      this._lockTooltip = true;

      this.set('editMode', true);

      //render our templates and repositon based on new content
      this.$.ttContent.forceTemplateRender();
      this.$.tooltip.setPosition();

      this._currentDataEdit = evt.detail.data.annotationData;
      this.currentChart = Polymer.dom(evt).localTarget;
    },

    modalClose: function(evt) {

      //process data and assign to currentChart
      var newData;

      newData = {
        x: this.annotationValue[0],
        y: this.annotationValue[1],
        data: {
          message: this.$.modalText.value.trim()
        },
        series: this._seriesFound
      };
      this.currentChart.push('annotationData', newData);
      this.$.modalText.value = '';
    },

    _saveEdit: function(evt) {
      this._editAction = 'save';
      this._closeEdit();
    },

    _cancelEdit: function(evt) {
      this._editAction = 'cancel';
      this._closeEdit();
    },

    _deleteEdit: function(evt) {
      this._editAction = 'delete';
      this._closeEdit();
    },

    _closeEdit: function() {
      this.$.tooltip.set('opened', false);
      this.set('editMode', false);
      this._lockTooltip = false;
    },

    _tooltipHide: function() {

      var index;
      if(this._editAction === 'save') {
        index = this.currentChart.annotationData.indexOf(this._currentDataEdit);
        this.currentChart.annotationData[index].data.message = this.$.ttContent.annotationMessage;
      } else if(this._editAction === 'delete') {
        index = this.currentChart.annotationData.indexOf(this._currentDataEdit);
        this.currentChart.splice('annotationData', index, 1);
      }

      this._editAction = 'none';
    },

    _computeReadableValue: function(annotationValue, currentChart) {

      if(annotationValue === undefined || currentChart === undefined || annotationValue.length === 0) {
        return;
      }

      if(currentChart.nodeName === 'PX-VIS-TIMESERIES') {
        return '[' + Px.moment(annotationValue[0]).format() + ', ' + annotationValue[1].toFixed(2) + ']';
      } else if(this.isRadarParallel) {
        return '[' + annotationValue[1].toFixed(2)  + ']';
      } else {
        return '[' + annotationValue[0].toFixed(2)  + ', ' + annotationValue[1].toFixed(2)  + ']';
      }
    }
  });
})();
