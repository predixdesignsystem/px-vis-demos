(function() {
  Polymer({

    is: 'px-vis-demos-annotation',

    properties: {
      currentChart: {
        type: Object
      },

      isRadarParallel: {
        type: Boolean,
        value: false
      },

      currentDimension: {
        type: String
      },

      mousePos: {
        type: Array
      },

      allCharts: {
        type: Array
      },

      dropdownSeries: {
        type: Array
      },

      dropdownDisplayValue: {
        type: String
      },

      dropdownSelected: {
        type: String
      },

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

      editMode: {
        type: Boolean,
        value: false
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
      }, this);

      this.$.modal.addEventListener('btnModalPositiveClicked', this.modalClose.bind(this));

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

      //find the series available
      if(this.isRadarParallel) {
        //find what axis we clicked on. The click target is the interaction
        //space on top of the axis
        var axis = evt.detail.data.clickTarget.parentElement;
        this.set('currentDimension', axis.getAttribute('dimension'));
      } else {
        var keys = Object.keys(this.currentChart.completeSeriesConfig);
        this.set('dropdownSeries', keys);
        this.set('dropdownDisplayValue', keys[0]);
      }

      //store mouse pos for further use
      this.mousePos = evt.detail.data.mouseCoords;

      //open the modal
      this.$.modal.modalButtonClicked();
    },

    showAnnotation: function(evt) {

      if(!this._lockTooltip) {

        this.$.ttContent.annotationMessage = evt.detail.data.annotationData.data.message;

        //this.$.annotationPopover.set('for', evt.detail.data.icon);
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
      var seriesFound,
          val,
          newData;

      if(this.isRadarParallel) {
        seriesFound = this.currentDimension;
      } else {
        seriesFound = this.dropdownSelected ? this.dropdownSelected : this.dropdownDisplayValue;
      }

      val = this.currentChart.getDataFromPixel(this.mousePos, seriesFound);
      newData = {
        x: val[0],
        y: val[1],
        data: {
          message: this.$.modalText.value.trim()
        },
        series: seriesFound
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
    }
  });
})();
