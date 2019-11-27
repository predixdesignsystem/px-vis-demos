/*
Copyright (c) 2018, General Electric

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/**
demonstrating dynamically adding/removing charts

### Usage

    <px-vis-demos-dynamic-add></px-vis-demos-dynamic-add>

@element px-vis-demos-dynamic-add
@blurb demonstrating dynamically adding/removing charts
@homepage index.html
@demo index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import 'px-vis-timeseries/px-vis-timeseries.js';
import 'px-vis-xy-chart/px-vis-xy-chart.js';
import 'px-vis-polar/px-vis-polar.js';
import 'px-vis-radar/px-vis-radar.js';
import 'px-vis-parallel-coordinates/px-vis-parallel-coordinates.js';
import 'px-dropdown/px-dropdown.js';
import 'px-tooltip/px-tooltip.js';
import './css/px-vis-demos-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
Polymer({
  _template: html`
    <style include="px-vis-demos-styles"></style>

    <div class="flex flex--spaced">
      <!-- chart type + data-->
      <div>
        <p class="epsilon">Chart type and data</p>
        <div class="flex flex--col flex__item u-p" style="border: 1px solid #b6c3cc;">
          <label class="">Chart type</label>
          <!-- select chart type -->
          <div style="width:150px">
            <px-dropdown selected="{{selectedChartType}}" items="[[chartTypes]]">
            </px-dropdown>
          </div>
          <label class="">Dataset</label>
          <div style="width:450px">
            <px-dropdown id="dataSetDropdown" items="[[_currentDataSets]]">
            </px-dropdown>
          </div>
          <label>Number of charts</label>
          <input id="chartNumber" type="text" class="text-input input--tiny" value="1">

          <label>Resize debounce timing (ms)</label>
          <input id="resizeDebounce" type="text" class="text-input input--tiny" value="{{_chartOptions.resizeDebounce::change}}">

          <div>
            <input id="reuse" type="checkbox">
            <label id="reuseLabel" for="reuse" class="label--inline">Reuse chart from pool</label>
            <px-tooltip for="reuseLabel" delay="50" tooltip-message="Instead of creating a chart from scratch it will attempt to reuse older charts that have been previously created and removed. This isn't a vis property per say and needs to be managed by the app" orientation="auto"></px-tooltip>
          </div>

          <div>
            <px-tooltip for="prvResizeLabel" delay="50" tooltip-message="If prevent resize is on then the chart will be appended in a div having the height value defined below. If prevent resize is off then the chart will be appended in a div with no width and height and have its own width and height set." orientation="auto"></px-tooltip>
            <input id="prvResize" type="checkbox" checked="{{_chartOptions.preventResize::change}}">
            <label for="prvResize" id="prvResizeLabel" class="label--inline">Prevent resize</label>
          </div>

          <div class="u-pl">

            <label for="height" id="heightLabel">height</label>
            <input id="height" type="text" class="text-input input--tiny" value="{{_chartOptions.height::input}}">

            <template is="dom-if" if="[[_chartOptions.preventResize]]">

              <label for="width" id="widthLabel">width</label>
              <input id="width" type="text" class="text-input input--tiny" value="{{_chartOptions.width::input}}">

            </template>
          </div>

        </div>
      </div>

      <!--Chart options-->
      <div class="">
        <p class="epsilon">Chart Options</p>
        <div class=" flex flex--col flex__item u-p" style="border: 1px solid #b6c3cc">

          <!--web worker-->
          <template is="dom-if" if="[[_canWebWorker(selectedChartType)]]">
            <div id="preventWwSyncDiv">
              <input id="preventWwSync" type="checkbox" checked="{{_chartOptions.preventWwSync::change}}">
              <label for="preventWwSync" class="label--inline">Prevent web worker synchronization</label>
              <px-tooltip for="preventWwSyncDiv" delay="50" tooltip-message="Prevents the chart from synchronizing its data with a webworker. This can be turned on to minimize the memory footprint of the chart WARNING: turning the synchronization off will: - prevent the chart from being able to use crosshair feature - slow down data search for tooltip/register - slow down calculating extents for the chart if it needs to. We advise against turning it off but it might be beneficial in specific scenarios (high number of small charts with minimum interaction for example)" orientation="auto"></px-tooltip>
            </div>
          </template>

          <!--toolbar-->
          <div id="modifyToolbarGroup">
            <input id="modifyingToolbar" type="checkbox" checked="{{_chartOptions.customToolbar::change}}">
            <label for="modifyingToolbar" class="label--inline" id="modifyingToolbarLabel">Toolbar to modify series</label>
          </div>
          <px-tooltip for="modifyToolbarGroup" delay="50" tooltip-message="includes custom buttons in the toolbar to dynamically add/delete/modify series on the chart" orientation="auto"></px-tooltip>

          <div id="hardMuteGroup">
            <input id="hardMute" type="checkbox" checked="{{_chartOptions.hardMute::change}}">
            <label for="hardMute" class="label--inline" id="hardMuteLabel">Hard Mute</label>
          </div>
          <px-tooltip for="hardMuteGroup" delay="50" tooltip-message="when hard mute is on muting a series will ignore it for extents calculation and tooltip/register search" orientation="auto"></px-tooltip>

          <div id="crossHairGroup">
            <input id="crosshair" type="checkbox" checked="{{_chartOptions.addCrosshairData::change}}">
            <label for="crosshair" class="label--inline" id="crosshairLabel">Add Crosshair Data</label>
          </div>
          <px-tooltip for="crossHairGroup" delay="50" tooltip-message="Add some crosshair data tot he chart before appending it to the dom" orientation="auto"></px-tooltip>

          <div id="showTooltipGroup">
            <input id="showTooltip" type="checkbox" checked="{{_chartOptions.showTooltip::change}}">
            <label for="showTooltip" class="label--inline" id="showTooltipLabel">Show Tooltip</label>
          </div>

          <template is="dom-if" if="[[_isPolar(selectedChartType)]]">
            <div>
              <input id="allowNegativeValues" type="checkbox" checked="{{_chartOptions.allowNegativeValues::change}}">
              <label for="allowNegativeValues" class="label--inline">allow negative values</label>
            </div>
            <div>
              <input id="showArrows" type="checkbox" checked="{{_chartOptions.showArrows::change}}">
              <label for="showArrows" class="label--inline">show arrows</label>
            </div>
          </template>

          <template is="dom-if" if="[[_canMultiY(selectedChartType)]]">
            <div>
              <input id="showGaps" type="checkbox" checked="{{_chartOptions.showGaps::change}}">
              <label for="showGaps" class="label--inline">Show Gaps</label>
            </div>
          </template>

         <template is="dom-if" if="[[_isTimeseries(selectedChartType)]]">
            <div>
              <input id="disableNav" type="checkbox" checked="{{_chartOptions.disableNav::change}}">
              <label for="disableNav" class="label--inline">disable Navigator</label>
            </div>
            <!--EVENTS-->
            <div>
              <input id="addEvents" type="checkbox" checked="{{_chartOptions.addEvents::change}}">
              <label for="addEvents" class="label--inline">Add some events</label>
            </div>

            <!--EVENTS OPTIONS-->
            <template is="dom-if" if="[[_chartOptions.addEvents]]">
              <div class="u-pl">
                <label for="eventsNumber" id="eventsNumberLabel">Number of Events</label>
                <input id="eventsNumber" type="text" class="text-input input--tiny" value="{{_chartOptions.eventsNumber::input}}">
                <label for="eventsType" id="eventsTypeLabel">Type (fa, unicode, default)</label>
                <input id="eventsType" type="text" class="text-input input--tiny" value="{{_chartOptions.eventsType::input}}">
                <div>
                  <input id="eventsNoLine" type="checkbox" checked="{{_chartOptions.eventsNoLine::change}}">
                  <label for="eventsNoLine" class="label--inline">No line</label>
                </div>
                <div>
                  <input id="eventsDisableTooltip" type="checkbox" checked="{{_chartOptions.eventsNoTooltip::change}}">
                  <label id="eventsDisableTooltipLabel" for="eventsDisableTooltip" class="label--inline">Disable tooltip</label>
                  <px-tooltip for="eventsDisableTooltipLabel" delay="50" tooltip-message="Disable event tooltip for faster events drawing and significantly reduce memory usage." orientation="top"></px-tooltip>
                </div>
              </div>
            </template>
            <!--MARKERS-->
            <template is="dom-if" if="[[_isTimeseries(selectedChartType)]]">
              <div>
                <input id="addMarkers" type="checkbox" checked="{{_chartOptions.addMarkers::change}}">
                <label for="addMarkers" class="label--inline">Add some markers</label>
              </div>
            </template>

            <!-- MARKERS options -->
            <template is="dom-if" if="[[_chartOptions.addMarkers]]">
              <div>
                <div class="flex flex--wrap">
                  <div class="flex flex--col">
                    <label for="markerNumber" id="markerNumberLabel"># of markers</label>
                    <input id="markerNumber" type="text" class="text-input input--tiny" value="{{_chartOptions.markerTSNumber::input}}">
                  </div>
                  <div class="flex flex--col">
                    <label for="markerRows" id="markerRowsLabel"># of rows</label>
                    <input id="markerRows" type="text" class="text-input input--tiny" value="{{_chartOptions.markerTSRowsNumber::input}}">
                  </div>

                  <div class="flex flex--col">
                    <label for="markerSize" id="markerSizeLabel">Size</label>
                    <input id="markerSize" type="text" class="text-input input--tiny" value="{{_chartOptions.markerTSSize::input}}">
                  </div>
                  <div class="flex flex--col">
                    <label for="markerScale" id="markerScaleLabel">Scale</label>
                    <input id="markerScale" type="text" class="text-input input--tiny" value="{{_chartOptions.markerTSScale::input}}">
                  </div>

                  <div class="flex flex--col">
                    <label for="markerFillOpacity" id="markerFillOpacityLabel">Fill Opacity</label>
                    <input id="markerFillOpacity" type="text" class="text-input input--tiny" value="{{_chartOptions.markerTSFillOpacity::input}}">
                  </div>

                  <div class="flex flex--col">
                    <label for="markerStrokeOpacity" id="markerStrokeOpacityLabel">Stroke Opacity</label>
                    <input id="markerStrokeOpacity" type="text" class="text-input input--tiny" value="{{_chartOptions.markerTSStrokeOpacity::input}}">
                  </div>

                  <div class="flex flex--col">
                    <label for="markerSymbol" id="markerSymbolLabel">Symbol</label>
                    <input id="markerSymbol" type="text" class="text-input input--tiny" value="{{_chartOptions.markerTSSymbol::input}}">
                    </div>
                    <px-tooltip for="markerSymbol" delay="50" tooltip-message="circle/cross/diamond/square/triangle-up/star/wye/bar/thick-bar/thin-bar/x" orientation="auto"></px-tooltip>


                    <div class="flex flex--col">
                      <input id="markerShowTooltip" type="checkbox" checked="{{_chartOptions.markerShowTooltip::change}}">
                      <label for="markerShowTooltip" class="label--inline">Show Tooltip</label>
                    </div>
                  </div>
              </div>
            </template>
            <!--THRESHOLD-->
            <div>
              <input id="addThresholds" type="checkbox" checked="{{_chartOptions.addThresholds::change}}">
              <label for="addThresholds" class="label--inline">Add some thresholds</label>
            </div>
          </template>

          <div>
            <input id="addDynamicMenus" type="checkbox" checked="{{_chartOptions.addDynamicMenus::change}}">
            <label for="addDynamicMenus" class="label--inline">Add register dynamic menus</label>
          </div>

          <template is="dom-if" if="[[_canMultiY(selectedChartType)]]">
            <div>
              <input id="multiY" type="checkbox" checked="{{_chartOptions.multiAxis::change}}">
              <label for="multiY" class="label--inline">Use multi Y axes</label>
            </div>
          </template>

          <!--Scatter-->
          <template is="dom-if" if="[[_canScatter(selectedChartType)]]">
            <div>
              <input id="scatterType" type="checkbox" checked="{{_chartOptions.scatter::change}}">
              <label for="scatterType" class="label--inline">Use scatter</label>
            </div>
          </template>

          <!-- Scatter options -->
          <template is="dom-if" if="[[_chartOptions.scatter]]">
            <div>
              <div class="flex flex--wrap">
                <div class="flex flex--col">
                  <label for="markerTSSize" id="markerTSSizeLabel">Size</label>
                  <input id="markerTSSize" type="text" class="text-input input--tiny" value="{{_chartOptions.markerSize::input}}">
                </div>
                <div class="flex flex--col">
                  <label for="markerTSScale" id="markerTSScaleLabel">Scale</label>
                  <input id="markerTSScale" type="text" class="text-input input--tiny" value="{{_chartOptions.markerScale::input}}">
                </div>

                <div class="flex flex--col">
                  <label for="markerTSFillOpacity" id="markerTSFillOpacityLabel">Fill Opacity</label>
                  <input id="markerTSFillOpacity" type="text" class="text-input input--tiny" value="{{_chartOptions.markerFillOpacity::input}}">
                </div>

                <div class="flex flex--col">
                  <label for="markerTSStrokeOpacity" id="markerTSStrokeOpacityLabel">Stroke Opacity</label>
                  <input id="markerTSStrokeOpacity" type="text" class="text-input input--tiny" value="{{_chartOptions.markerStrokeOpacity::input}}">
                </div>


                <div class="flex flex--col">
                  <label for="markerSymbol" id="markerTSSymbolLabel">Symbol</label>
                  <input id="markerTSSymbol" type="text" class="text-input input--tiny" value="{{_chartOptions.markerSymbol::input}}">
                  <px-tooltip for="markerSymbol" delay="50" tooltip-message="circle/cross/diamond/square/triangle-up/star/wye/bar/thick-bar/thin-bar/x" orientation="auto"></px-tooltip>
                </div>
              </div>
            </div>
          </template>

          <template is="dom-if" if="[[_canSvg(selectedChartType)]]">
            <div>
              <input id="rendToSvg" type="checkbox" checked="{{_chartOptions.rendToSvg::change}}">
              <label for="rendToSvg" class="label--inline">Render to svg</label>
            </div>
            <div>
              <input id="categories" type="checkbox" checked="{{_chartOptions.addCategories::change}}">
              <label for="categories" class="label--inline">Add categories</label>
            </div>
            <div>
              <input id="categoriesRegister" type="checkbox" checked="{{_chartOptions.hideCategoryRegister::change}}">
              <label for="categoriesRegister" class="label--inline">Hide categories register</label>
            </div>
          </template>

          <div>
            <input id="hideRegister" type="checkbox" checked="{{_chartOptions.hideRegister::change}}">
            <label for="hideRegister" class="label--inline">Hide register</label>
          </div>

          <template is="dom-if" if="[[_canChartExtents(selectedChartType)]]">
            <div>
              <input id="includeChartExtents" type="checkbox" checked="{{_chartOptions.includeChartExtents::change}}">
              <label for="includeChartExtents" class="label--inline">Include chart extents</label>
            </div>
          </template>


          <template is="dom-if" if="[[_canCanvas(selectedChartType)]]">
            <div>
              <input id="rendToCanvas" type="checkbox" checked="{{_chartOptions.canvas::change}}">
              <label for="rendToCanvas" class="label--inline">Render to canvas</label>
            </div>
          </template>
        </div>

      </div>

      <!-- data generation -->
      <div class="">
        <p class="epsilon">Data Generation for selected chart type</p>
        <div class="flex flex--col flex__item u-p" style="border: 1px solid #b6c3cc;">
          <label for="pointsPerSeries">Points Per Series</label>
          <input id="pointsPerSeries" placeholder="number of points per series" class="text-input input--tiny" type="text" value="1000">
          <label for="seriesNumber" class="u-mt-">Number of series</label>
          <input class="text-input input--tiny" id="seriesNumber" type="text" value="4">
          <div>
            <input id="randomise" type="checkbox" checked="{{_generateOptions.randomise::change}}">
            <label for="randomise" class="label--inline">fully randomise data</label>
          </div>
          <label for="variance" class="u-mt-">"Variance" (impacts "how much" the data changes). &gt; 0</label>
          <input class="text-input input--tiny" disabled="[[_generateOptions.randomise]]" id="variance" value="{{_generateOptions.variance::input}}">
          <button style="width:100px" class="btn btn--primary u-mt-" id="generate">Generate!</button>
        </div>
      </div>
    </div>
    <div class="u-mt-">
      <px-tooltip for="btnCreate" delay="50" tooltip-message="Create charts and append them to the dom. Measures the time taken from before chart creation to the last drawing." orientation="auto"></px-tooltip>
      <px-tooltip for="btnMove" delay="50" tooltip-message="Removes the last set of charts created and after 500ms append them to the dom again. The time measured does not take the 500ms into account." orientation="top"></px-tooltip>
      <button id="btnCreate" class="btn btn--primary">Create chart(s)</button>
      <button id="btnRemove" class="btn">Remove last creation</button>
      <button id="btnMove" class="btn">Move last creation in DOM</button>
    </div>
    <div id="chartHolder">
    </div>
`,

  is:'px-vis-demos-dynamic-add',
  properties:{chartTypes:{type:Array,value:function value(){return[{'key':'px-vis-timeseries','val':'px-vis-timeseries'},{'key':'px-vis-xy-chart','val':'px-vis-xy-chart'},{'key':'px-vis-polar','val':'px-vis-polar'},{'key':'px-vis-radar','val':'px-vis-radar'},{'key':'px-vis-parallel-coordinates','val':'px-vis-parallel-coordinates'}]},readOnly:true},selectedChartType:{type:String,value:'px-vis-timeseries'},dataSets:{type:Object,value:function value(){return{'px-vis-timeseries':[{'key':'dummy','val':'PLEASE GENERATE DATA'}],'px-vis-xy-chart':[{'key':'dummy','val':'PLEASE GENERATE DATA'}],'px-vis-polar':[{'key':'dummy','val':'PLEASE GENERATE DATA'}],'px-vis-radar':[{'key':'dummy','val':'PLEASE GENERATE DATA'}],'px-vis-parallel-coordinates':[{'key':'dummy','val':'PLEASE GENERATE DATA'}]}}},chartPool:{type:Object,value:function value(){return{'px-vis-timeseries':[],'px-vis-xy-chart':[],'px-vis-polar':[],'px-vis-radar':[],'px-vis-parallel-coordinates':[],'px-vis-pie-chart':[]}}},_currentDataSets:{type:Array},_generateListener:{type:Function},_createListener:{type:Function},_removeListener:{type:Function},_drawingListener:{type:Function},_moveListener:{type:Function},_generateOptions:{type:Object,value:function value(){return{'startTime':571474800000,'endTime':Math.floor(Date.now()),'dataMin':-10,'dataMax':10,'variance':0.7,'counter':0,'randomise':false}}},_chartOptions:{type:Object,value:function value(){return{'scatter':false,'disableNav':false,'canvas':false,'progressiveRendering':false,'addDynamicMenus':false,'addThresholds':false,'multiAxis':false,'rendToSvg':false,'resizeDebounce':250,'width':800,'height':500,'preventResize':false,'customToolbar':false,'hideRegister':false,'includeChartExtents':false,'addEvents':false,'eventsNumber':4,'eventsType':'unicode','eventsNoLine':false,'eventsNoTooltip':false,'markerSize':64,'markerSymbol':'circle','markerScale':1,'markerFillOpacity':0.6,'markerStrokeOpacity':1,'preventWwSync':false,'addCategories':false,'hideCategoryRegister':false,'markerTSNumber':50,'markerTSRowsNumber':3,'markerTSSize':64,'markerTSSymbol':'bar','markerTSScale':1,'markerTSFillOpacity':0.6,'markerTSStrokeOpacity':1,'markerShowTooltip':true,'hardMute':false,'showTooltip':false,'allowNegativeValues':false,'addCrosshairData':false}}},_drawingCounter:{type:Number,value:0},_drawingsPerChart:{type:Number,value:0},_drawingMultiplier:{type:Number,value:1},_drawingNumberOfCharts:{type:Number,value:0},_drawingTimerName:{type:String},_test:{type:Number,value:99999}},
  observers:['_computeCurrentDataSets(selectedChartType, dataSets.*)'],
  attached:function attached(){this._generateListener=this._generateDataSet.bind(this);this._createListener=this._createChart.bind(this);this._removeListener=this._removeChart.bind(this);this._drawingListener=this._drawingListen.bind(this);this._moveListener=this._moveChart.bind(this);this.$.generate.addEventListener('click',this._generateListener);this.$.btnCreate.addEventListener('click',this._createListener);this.$.btnRemove.addEventListener('click',this._removeListener);this.$.btnMove.addEventListener('click',this._moveListener);this.addEventListener('px-vis-scatter-rendering-ended',this._drawingListener);this.addEventListener('px-vis-line-svg-rendering-ended',this._drawingListener);this.addEventListener('px-vis-chart-canvas-rendering-ended',this._drawingListener)},
  detached:function detached(){this.$.generate.removeEventListener('click',this._generateListener);this.$.btnCreate.removeEventListener('click',this._createListener);this.$.btnRemove.removeEventListener('click',this._removeListener);this.$.btnMove.removeEventListener('click',this._moveListener);this.removeEventListener('px-vis-scatter-rendering-ended',this._drawingListener);this.removeEventListener('px-vis-line-svg-rendering-ended',this._drawingListener);this.removeEventListener('px-vis-chart-canvas-rendering-ended',this._drawingListener)},
  _generateDataSet:function _generateDataSet(){var dataSet=this._generateData(this.$.pointsPerSeries.value,this.$.seriesNumber.value,this.selectedChartType);if(this.dataSets[this.selectedChartType][0].key==='dummy'){this.dataSets[this.selectedChartType][0]=dataSet}else{this.dataSets[this.selectedChartType].push(dataSet)}this._computeCurrentDataSets()},
  _generateData:function _generateData(pointsNumber,seriesNumber,chartType,seriesNames){console.time('generating '+pointsNumber*seriesNumber+' total ('+seriesNumber+' series each '+pointsNumber+' points) for '+chartType);var result=[],step=Math.floor((this._generateOptions.endTime-this._generateOptions.startTime)/pointsNumber),isPolar=chartType==='px-vis-polar',extents={},yMins={},yMaxs={};if(chartType==='px-vis-timeseries'){extents.x=[this._generateOptions.startTime,this._generateOptions.startTime+pointsNumber*step]}else if(chartType==='px-vis-xy-chart'){extents.x=[0,pointsNumber]}this._generateOptions.counter++;for(var i=0;i<pointsNumber;i++){var newData={};newData.timeStamp=this._generateOptions.startTime+i*step;for(var j=0;j<seriesNumber;j++){var name=seriesNames?seriesNames[j]:'y'+j,axisName='axis'+j;if(result.length===0||this._generateOptions.randomise){newData[name]=(Math.random()*(this._generateOptions.dataMax-this._generateOptions.dataMin)+this._generateOptions.dataMin).toFixed(3);newData['x']=isPolar?Math.random()*360:Math.random()*(this._generateOptions.dataMax-this._generateOptions.dataMin)+this._generateOptions.dataMin}else{newData[name]=(Number(result[i-1][name])+(Math.random()*2-1)*this._generateOptions.variance).toFixed(3);newData['x']=i}if(chartType==='px-vis-radar'||chartType==='px-vis-parallel-coordinates'){newData['category']=(i%4).toString()}if(!extents[axisName]){extents[axisName]=[Number.MAX_VALUE,-Number.MAX_VALUE]}if(Number(newData[name])<Number(extents[axisName][0])){extents[axisName][0]=newData[name]}if(Number(newData[name])>Number(extents[axisName][1])){extents[axisName][1]=newData[name]}}var extKeys=Object.keys(extents),min=Number.MAX_VALUE,max=-Number.MAX_VALUE;for(var k=0;k<extKeys.length;k++){if(extKeys[k]!=='x'){if(Number(extents[extKeys[k]][1])>max){max=extents[extKeys[k]][1]}if(Number(extents[extKeys[k]][0])<min){min=extents[extKeys[k]][0]}}}extents.y=[min,max];result.push(newData)}console.timeEnd('generating '+pointsNumber*seriesNumber+' total ('+seriesNumber+' series each '+pointsNumber+' points) for '+chartType);return{'val':'[Gen]['+this._generateOptions.counter+'] '+pointsNumber*seriesNumber+' total ('+seriesNumber+' series each '+pointsNumber+' points)','key':{'data':result,'extents':extents}}},
  _computeCurrentDataSets:function _computeCurrentDataSets(){this.set('_currentDataSets',this.dataSets[this.selectedChartType].slice());if(this.dataSets[this.selectedChartType]&&this.dataSets[this.selectedChartType].length){this.$.dataSetDropdown.set('displayValue',this.dataSets[this.selectedChartType][this.dataSets[this.selectedChartType].length-1].val);this.$.dataSetDropdown.set('selectedKey',this.dataSets[this.selectedChartType][this.dataSets[this.selectedChartType].length-1].key)}},
  _canScatter:function _canScatter(selectedChartType){return selectedChartType!=='px-vis-parallel-coordinates'&&selectedChartType!=='px-vis-radar'&&selectedChartType!=='px-vis-pie-chart'&&selectedChartType!=='px-vis-polar'},
  _canCanvas:function _canCanvas(selectedChartType){return selectedChartType==='px-vis-timeseries'||selectedChartType==='px-vis-xy-chart'||selectedChartType==='px-vis-polar'},
  _canSvg:function _canSvg(selectedChartType){return selectedChartType==='px-vis-parallel-coordinates'||selectedChartType==='px-vis-radar'},
  _canProgRender:function _canProgRender(selectedChartType,canvas,svg){return this._canCanvas(selectedChartType)&&canvas||this._canSvg(selectedChartType)&&!svg},
  _isTimeseries:function _isTimeseries(selectedChartType){return selectedChartType==='px-vis-timeseries'},
  _isPolar:function _isPolar(selectedChartType){return selectedChartType==='px-vis-polar'},
  _canMultiY:function _canMultiY(selectedChartType){return selectedChartType==='px-vis-timeseries'||selectedChartType==='px-vis-xy-chart'},
  _canChartExtents:function _canChartExtents(selectedChartType){return selectedChartType!=='px-vis-parallel-coordinates'&&selectedChartType!=='px-vis-polar'},
  _canWebWorker:function _canWebWorker(selectedChartType){return selectedChartType!=='px-vis-parallel-coordinates'&&selectedChartType!=='px-vis-radar'},
  _createChart:function _createChart(){var data=this.$.dataSetDropdown.selectedKey.data,extents=this.$.dataSetDropdown.selectedKey.extents;if(this.$.dataSetDropdown.selectedKey==='dummy'){console.log('No data selected, please generate data for '+this.selectedChartType);return}if(data){this._drawingCounter=0;this._drawingsPerChart=this._getNumberOfDrawingPerCharts(data);this._drawingNumberOfCharts=this.$.chartNumber.value;this._drawingTimerName='draw '+this._drawingNumberOfCharts+' '+this.selectedChartType;if(this.selectedChartType==='px-vis-timeseries'||this.selectedChartType==='px-vis-xy-chart'||this.selectedChartType==='px-vis-polar'){if(this._chartOptions.canvas){this._drawingMultiplier=this.selectedChartType==='px-vis-timeseries'&&!this._chartOptions.disableNav?2:1}else{this._drawingMultiplier=this._drawingsPerChart}}else{if(this._chartOptions.rendToSvg){this._drawingMultiplier=1}else{this._drawingMultiplier=this._drawingsPerChart}}var newDiv,newChart,currWidth=this.$.chartHolder.getBoundingClientRect().width,fragment=document.createElement('div');fragment.classList.add('creationBatchDiv');for(var i=0;i<this._drawingNumberOfCharts;i++){newDiv=document.createElement('div');newDiv.classList.add('divwrapper');if(this.$.reuse.checked){if(this.chartPool[this.selectedChartType].length){newChart=this.chartPool[this.selectedChartType].pop()}else{console.log('failed to reuse '+this.selectedChartType+' from chartPool, none available');newChart=document.createElement(this.selectedChartType)}}else{newChart=document.createElement(this.selectedChartType)}newChart.debounceResizeTiming=this._chartOptions.resizeDebounce;newChart.set('preventResize',this._chartOptions.preventResize);newChart.set('height',this._chartOptions.height);if(newChart.preventResize){newChart.set('width',this._chartOptions.width)}else{newChart.width=currWidth}this._processOptions(newChart,extents,data);newChart.chartData=data;newChart.hardMute=this._chartOptions.hardMute;newChart.showTooltip=this._chartOptions.showTooltip;if(this._chartOptions.addCrosshairData){newChart.set('highlighterConfig',{'drawWithLocalCrosshairData':false,'differentDataset':true,'fuzz':100000000000,'showTooltipData':true});var timestamp=data[Math.floor(data.length/2)].timeStamp;newChart.set('crosshairData',{'rawData':[{'timeStamp':timestamp}],'timeStamps':[timestamp]})}if(this._chartOptions.customToolbar){var newConf={};newConf.config={};if(newChart.toolbarConfig){var keys=Object.keys(newChart.toolbarConfig.config);for(var j=0;j<keys.length;j++){newConf.config[keys[j]]=newChart.toolbarConfig.config[keys[j]]}}newConf.config.addSerie={'tooltipLabel':'Add a serie to the chart','title':'+1','onClick':this._addSerie,'onClickContext':this,'chart':newChart};newConf.config.removeSerie={'tooltipLabel':'Remove a serie from the chart','title':'-1','onClick':this._removeSerie,'onClickContext':this,'chart':newChart};newConf.config.modifyData={'tooltipLabel':'Changes the data for the current series','title':'~','onClick':this._changeData,'onClickContext':this,'chart':newChart};newConf.config.modifyDataAndSeries={'tooltipLabel':'Changes the data and the series','title':'~~','onClick':this._changeDataAndSeries,'onClickContext':this,'chart':newChart};newConf.config.addAndModify={'tooltipLabel':'Changes the data for the current series and add 1 series','title':'+1/~','onClick':this._addSerieAndModifyData,'onClickContext':this,'chart':newChart};newConf.config.removeAndModify={'tooltipLabel':'Changes the data for the current series and remove 1 series','title':'-1/~','onClick':this._removeSerieAndModifyData,'onClickContext':this,'chart':newChart};newChart.set('toolbarConfig',newConf)}dom(newDiv).appendChild(newChart);dom(fragment).appendChild(newDiv)}dom(this.$.chartHolder).appendChild(fragment);this._startPerfMeasure()}else{console.log('please select data')}},
  _generateSeriesName:function _generateSeriesName(){return'y'+Math.floor(Math.random()*1000)},
  _addSerieAndModifyData:function _addSerieAndModifyData(info){var numberOfSeries=Object.keys(info.chart.chartData[0]).length-2,seriesNames=Object.keys(info.chart.chartData[0]).filter(function(d,i){return d[0]==='y'}),data,seriesName=this._generateSeriesName();seriesNames.push(seriesName);data=this._generateData(info.chart.chartData.length,numberOfSeries+1,info.chart.nodeName.toLowerCase(),seriesNames);info.chart.set('chartData',data.key.data);this._addOneSerieFromConfig(info.chart,numberOfSeries,seriesName)},
  _removeSerieAndModifyData:function _removeSerieAndModifyData(info){var data,seriesNames=Object.keys(info.chart.chartData[0]).filter(function(d,i){return d[0]==='y'});data=this._generateData(info.chart.chartData.length,Object.keys(info.chart.chartData[0]).length-3,info.chart.nodeName.toLowerCase(),seriesNames);var missing,keys=Object.keys(data.key.data[0]);for(var i=0;i<seriesNames.length;i++){if(!data.key.data[0][seriesNames[i]]){missing=seriesNames[i];break}}info.chart.set('chartData',data.key.data);this._deleteOneSerieFromConfig(info.chart,missing)},
  _changeData:function _changeData(info){var data,seriesNames=Object.keys(info.chart.chartData[0]).filter(function(d,i){return d[0]==='y'});data=this._generateData(info.chart.chartData.length,Object.keys(info.chart.chartData[0]).length-2,info.chart.nodeName.toLowerCase(),seriesNames);info.chart.set('chartData',data.key.data)},
  _changeDataAndSeries:function _changeDataAndSeries(info){var numberOfSeries=Object.keys(info.chart.chartData[0]).length-2,seriesNames=[],currentNames=Object.keys(info.chart.chartData[0]).filter(function(d,i){return d[0]==='y'}),data;for(var i=0;i<currentNames.length;i++){seriesNames.push(this._generateSeriesName())}data=this._generateData(info.chart.chartData.length,numberOfSeries,info.chart.nodeName.toLowerCase(),seriesNames);info.chart.set('chartData',data.key.data);if(info.chart.nodeName.toLowerCase()==='px-vis-timeseries'||info.chart.nodeName.toLowerCase()==='px-vis-xy-chart'||info.chart.nodeName.toLowerCase()==='px-vis-polar'){var newConf={};for(var i=0;i<numberOfSeries;i++){if(info.chart.nodeName.toLowerCase()==='px-vis-polar'){newConf[seriesNames[i]]={'x':'x','y':seriesNames[i],'yAxisUnit':'u'}}else{newConf[seriesNames[i]]=this._generateSeriesConfigXYTS(seriesNames[i].slice(1),false,info.chart.nodeName.toLowerCase()==='px-vis-timeseries',info.chart)}}info.chart.set('seriesConfig',newConf)}else if(info.chart.nodeName.toLowerCase()==='px-vis-parallel-coordinates'||info.chart.nodeName.toLowerCase()==='px-vis-radar'){info.chart._computeAxes()}},
  _removeSerie:function _removeSerie(info){var currentNames=Object.keys(info.chart.chartData[0]).filter(function(d,i){return d[0]==='y'}),seriesName=currentNames[currentNames.length-1];this._deleteOneSeriesData(info.chart.chartData,seriesName);this._deleteOneSerieFromConfig(info.chart,seriesName)},
  _deleteOneSerieFromConfig:function _deleteOneSerieFromConfig(chart,seriesName){if(chart.nodeName.toLowerCase()==='px-vis-timeseries'||chart.nodeName.toLowerCase()==='px-vis-xy-chart'||chart.nodeName.toLowerCase()==='px-vis-polar'){var newConf={},confKeys=Object.keys(chart.seriesConfig);for(var i=0;i<confKeys.length;i++){if(seriesName!==confKeys[i]){newConf[confKeys[i]]=chart.seriesConfig[confKeys[i]]}}chart.set('seriesConfig',newConf)}else if(chart.nodeName.toLowerCase()==='px-vis-parallel-coordinates'||chart.nodeName.toLowerCase()==='px-vis-radar'){chart._computeAxes()}},
  _addOneSerieFromConfig:function _addOneSerieFromConfig(chart,numberOfSeries,seriesName){if(chart.nodeName.toLowerCase()==='px-vis-timeseries'||chart.nodeName.toLowerCase()==='px-vis-xy-chart'||chart.nodeName.toLowerCase()==='px-vis-polar'){var newConf={},confKeys=Object.keys(chart.seriesConfig),isTS=chart.nodeName.toLowerCase()==='px-vis-timeseries';for(var i=0;i<confKeys.length;i++){newConf[confKeys[i]]=chart.seriesConfig[confKeys[i]]}if(chart.nodeName.toLowerCase()==='px-vis-polar'){newConf[seriesName]={'x':'x','y':seriesName,'yAxisUnit':'u'}}else{newConf[seriesName]=this._generateSeriesConfigXYTS(seriesName.slice(1),false,isTS,chart)}chart.set('seriesConfig',newConf)}else if(chart.nodeName.toLowerCase()==='px-vis-parallel-coordinates'||chart.nodeName.toLowerCase()==='px-vis-radar'){chart._computeAxes()}},
  _addSerie:function _addSerie(info){var numberOfSeries=Object.keys(info.chart.chartData[0]).length-2,seriesName=this._generateSeriesName();this._addOneSeriesData(info.chart.chartData,seriesName);this._addOneSerieFromConfig(info.chart,numberOfSeries,seriesName)},
  _addOneSeriesData:function _addOneSeriesData(data,seriesName){var number=Object.keys(data[0]).length-2;for(var i=0;i<data.length;i++){if(i===0){data[i][seriesName]=Math.random()*(this._generateOptions.dataMax-this._generateOptions.dataMin)+this._generateOptions.dataMin}else{data[i][seriesName]=data[i-1][seriesName]+(Math.random()*2-1)*this._generateOptions.variance}}},
  _deleteOneSeriesData:function _deleteOneSeriesData(data,seriesName){var number=Object.keys(data[0]).length-3;for(var i=0;i<data.length;i++){delete data[i][seriesName]}},
  _generateSeriesConfigXYTS:function _generateSeriesConfigXYTS(numberId,useGenerationConfig,isTS,chart){var result={},seriesNumber,isMultiAxis=useGenerationConfig?this._chartOptions.multiAxis:Object.keys(chart.y).length>1,type;if(useGenerationConfig){seriesNumber=this._chartOptions.disableNav||!isTS?this._drawingsPerChart:this._drawingsPerChart/2;type=this._chartOptions.scatter?'scatter':'line'}else{var configKey=Object.keys(chart.seriesConfig);seriesNumber=Object.keys(chart.chartData[0]).length-2;type=chart.seriesConfig[configKey[0]].type}result={'x':isTS?'timeStamp':'x','y':'y'+numberId,'type':type,'yAxisUnit':'u','xAxisUnit':'u','markerSize':this._chartOptions.markerSize,'markerSymbol':this._chartOptions.markerSymbol,'markerScale':this._chartOptions.markerScale,'markerFillOpacity':this._chartOptions.markerFillOpacity,'markerStrokeOpacity':this._chartOptions.markerStrokeOpacity};if(isMultiAxis){var side;if(useGenerationConfig){side=numberId<seriesNumber/2?'left':'right'}else{side=chart.numLeftAxes===chart.numRightAxes?'left':'right'}result.axis={'id':'axis'+numberId,'number':numberId,'side':side}}return result},
  _removeChart:function _removeChart(){var wrappers=dom(this.root).querySelectorAll('.creationBatchDiv'),lastWrap=wrappers[wrappers.length-1],chart;if(lastWrap){if(this.$.reuse.checked){for(var i=0;i<lastWrap.children.length;i++){chart=lastWrap.children[i].children[0];this.chartPool[chart.nodeName.toLowerCase()].push(chart)}}dom(this.$.chartHolder).removeChild(lastWrap)}},
  _moveChart:function _moveChart(){var wrappers=dom(this.root).querySelectorAll('.divwrapper'),lastWrap=wrappers[wrappers.length-1];if(lastWrap){dom(this.$.chartHolder).removeChild(lastWrap);setTimeout(function(){this._startPerfMeasure();dom(this.$.chartHolder).appendChild(lastWrap)}.bind(this),500)}},
  _startPerfMeasure:function _startPerfMeasure(){window.performance.clearMarks();window.performance.mark('start')},
  _drawingListen:function _drawingListen(){this._drawingCounter++;if(this._drawingCounter%(this._drawingMultiplier*Number(this._drawingNumberOfCharts))===0){window.performance.mark('end');performance.clearMeasures();window.performance.measure('lastMeasure','start','end');var duration=window.performance.getEntriesByName('lastMeasure')[0].duration;console.log(this._drawingTimerName+': '+duration+' (average per chart: '+duration/Number(this._drawingNumberOfCharts)+')')}},
  _getNumberOfDrawingPerCharts:function _getNumberOfDrawingPerCharts(data){switch(this.selectedChartType){case'px-vis-timeseries':var multiplier=this._chartOptions.disableNav?1:2;return multiplier*(Object.keys(data[0]).length-2);case'px-vis-xy-chart':return Object.keys(data[0]).length-2;case'px-vis-polar':return Object.keys(data[0]).length-2;case'px-vis-parallel-coordinates':return 1;case'px-vis-radar':return 1;case'px-vis-pie-chart':}},
  _processOptions:function _processOptions(chart,extents,data){switch(this.selectedChartType){case'px-vis-timeseries':this._processOptionsTS(chart,extents,data);break;case'px-vis-xy-chart':this._processOptionsXY(chart,extents);break;case'px-vis-polar':this._processOptionsPolar(chart);break;case'px-vis-parallel-coordinates':this._processOptionsParallel(chart);break;case'px-vis-radar':this._processOptionsRadar(chart,extents);break;case'px-vis-pie-chart':}},
  _processOptionsTS:function _processOptionsTS(chart,extents,data){var seriesConfig={},seriesNumber=this._chartOptions.disableNav?this._drawingsPerChart:this._drawingsPerChart/2;for(var i=0;i<seriesNumber;i++){seriesConfig['y'+i]=this._generateSeriesConfigXYTS(i,true,true)}chart.set('seriesConfig',seriesConfig);chart.set('renderToCanvas',this._chartOptions.canvas);chart.toolbarConfig={'config':{'tooltipWithSearchTypesAndRadius':true,'advancedZoom':true,'pan':true}};chart.hideRegister=this._chartOptions.hideRegister;chart.showGaps=this._chartOptions.showGaps;if(this._chartOptions.includeChartExtents){chart.chartExtents=extents}else{chart.chartExtents={'x':['dynamic','dynamic'],'y':['dynamic','dynamic']}}chart.xAxisConfig={'title':'X','labelPosition':'center','orientation':'bottom'};chart.yAxisConfig={'title':'An Axis'};if(!this._chartOptions.multiAxis){chart.yAxisConfig.preventSeriesBar=true}if(this._chartOptions.addEvents){var step=(data[data.length-1].timeStamp-data[0].timeStamp)/this._chartOptions.eventsNumber,eventData=[];for(var i=0;i<this._chartOptions.eventsNumber;i++){eventData.push({'id':i,'time':data[0].timeStamp+step*(i+0.5),'label':this._chartOptions.eventsType})}chart.eventData=eventData;chart.eventConfig={'fa':{'color':'blue','icon':'px-fea:deployments','type':'px','offset':[0,0],'lineColor':'red','lineWeight':this._chartOptions.eventsNoLine?0:1,'enableTooltip':this._chartOptions.eventsNoTooltip?false:true},'unicode':{'color':'green','icon':'px-obj:truck','type':'px','offset':[1,0],'lineWeight':this._chartOptions.eventsNoLine?0:1,'enableTooltip':this._chartOptions.eventsNoTooltip?false:true},'default':{'lineWeight':this._chartOptions.eventsNoLine?0:1,'enableTooltip':this._chartOptions.eventsNoTooltip?false:true}}}else{chart.eventData=[];chart.eventConfig={}}if(this._chartOptions.addMarkers){var step=(data[data.length-1].timeStamp-data[0].timeStamp)/this._chartOptions.markerTSNumber,markerData=[],config={},newMargin={};newMargin.top=chart.margin.top;newMargin.bottom=chart.margin.bottom+50;newMargin.left=chart.margin.left;newMargin.right=chart.margin.right;for(var j=0;j<this._chartOptions.markerTSRowsNumber;j++){for(var i=0;i<this._chartOptions.markerTSNumber;i++){markerData.push({'time':Math.floor(data[0].timeStamp+step*(i+0.5)),'label':'label'+j,'customKey':'someVal','customKey2':1223124});if(j===0){markerData.push({'time':Math.floor(data[0].timeStamp+step*(i+0.5)),'label':'labelCustom','customKey':'someOtherVal','customKey2':1});markerData.push({'time':Math.floor(data[0].timeStamp+step*(i+0.5)),'label':'labelCustom2','customKey':'pwet','customKey2':323})}}config['label'+j]={'color':'rgb(123,0,0)','location':j%2===0?'top':'bottom','row':j,'markerSize':this._chartOptions.markerTSSize,'markerSymbol':this._chartOptions.markerTSSymbol,'markerScale':this._chartOptions.markerTSScale,'markerFillOpacity':this._chartOptions.markerTSFillOpacity,'markerStrokeOpacity':this._chartOptions.markerTSStrokeOpacity,'showTooltip':this._chartOptions.markerShowTooltip,'priority':10,'firstDateTimeFormat':'HH:mm A z','timezone':'Etc/GMT'};if(j%2===0){newMargin.top+=15}else{newMargin.bottom+=15}}config['labelCustom']={'color':'rgb(123,123,123)','location':'top','row':0,'markerSize':this._chartOptions.markerTSSize,'markerSymbol':'star','markerScale':this._chartOptions.markerTSScale,'markerFillOpacity':this._chartOptions.markerTSFillOpacity,'markerStrokeOpacity':this._chartOptions.markerTSStrokeOpacity,'showTooltip':this._chartOptions.markerShowTooltip,'priority':1,'firstDateTimeFormat':'HH:mm A z','timezone':'Etc/GMT+10'};config['labelCustom2']={'color':'rgb(0,255,0)','location':'top','row':0,'markerSize':this._chartOptions.markerTSSize,'markerSymbol':'wye','markerScale':this._chartOptions.markerTSScale,'markerFillOpacity':this._chartOptions.markerTSFillOpacity,'markerStrokeOpacity':this._chartOptions.markerTSStrokeOpacity,'showTooltip':this._chartOptions.markerShowTooltip,'priority':2,'firstDateTimeFormat':'HH:mm A z','timezone':'Etc/GMT+10'};chart.set('margin',newMargin);chart.markerData=markerData;chart.markerConfig=config}else{chart.markerData=[];chart.markerConfig={}}if(this._chartOptions.addThresholds){chart.thresholdData=[{'for':'series0','type':'max','value':8.4784},{'for':'series0','type':'min','value':-9.6531},{'for':'series0','type':'mean','value':0.330657585139331},{'for':'series1','type':'mean','value':2},{'for':'series1','type':'quartile','value':-3}];chart.thresholdConfig={'max':{'color':'red','dashPattern':'5,0','title':'MAX','showThresholdBox':true,'displayTitle':true}}}else{chart.thresholdData=[];chart.thresholdConfig={}}if(this._chartOptions.addDynamicMenus){chart.dynamicMenuConfig=[{'name':'Delete','action':'function(data) {var newConf = {}, confKeys = Object.keys(this.seriesConfig); for(var i=0; i<confKeys.length; i++) { if(data.additionalDetail.name !== confKeys[i]) {newConf[confKeys[i]] = this.seriesConfig[confKeys[i]];}}this.set("seriesConfig", newConf);}','eventName':'delete','icon':'px-vis:trash-series'},{'name':'Bring To Front','action':'function(data) { this.set("serieToRedrawOnTop", data.additionalDetail.name);}','eventName':'bring-to-front','icon':'px-vis:bring-to-front'}]}else{chart.dynamicMenuConfig=[]}chart.disableNavigator=this._chartOptions.disableNav;chart.preventWebWorkerSynchronization=this._chartOptions.preventWwSync},
  _processOptionsXY:function _processOptionsXY(chart,extents){var seriesConfig={};for(var i=0;i<this._drawingsPerChart;i++){seriesConfig['y'+i]=this._generateSeriesConfigXYTS(i,true,false)}chart.hideRegister=this._chartOptions.hideRegister;chart.showGaps=this._chartOptions.showGaps;chart.registerConfig={'forceDateTimeDisplay':'true','width':250};chart.toolbarConfig={'config':{'tooltipWithFullOptions':true,'advancedZoom':true,'pan':true}};chart.xAxisConfig={'title':'X','labelPosition':'center','orientation':'bottom'};chart.yAxisConfig={'title':'An Axis'};if(!this._chartOptions.multiAxis){chart.yAxisConfig.preventSeriesBar=true}chart.seriesConfig=seriesConfig;chart.margin={'top':'30','bottom':'60','left':'80','right':'100'};chart.timeData='timeStamp';if(this._chartOptions.includeChartExtents){chart.chartExtents=extents}else{chart.chartExtents={'x':['dynamic','dynamic'],'y':['dynamic','dynamic']}}chart.renderToCanvas=this._chartOptions.canvas;if(this._chartOptions.addDynamicMenus){chart.dynamicMenuConfig=[{'name':'Delete','action':'function(data) { var conf = this.seriesConfig;  delete conf[data.additionalDetail.name]; this.set("seriesConfig", {}); this.set("seriesConfig", conf);}','eventName':'delete','icon':'px-vis:trash-series'},{'name':'Bring To Front','action':'function(data) { this.set("serieToRedrawOnTop", data.additionalDetail.name);}','eventName':'bring-to-front','icon':'px-vis:bring-to-front'}]}else{chart.dynamicMenuConfig=[]}chart.preventWebWorkerSynchronization=this._chartOptions.preventWwSync},
  _processOptionsPolar:function _processOptionsPolar(chart){var seriesConfig={};for(var i=0;i<this._drawingsPerChart;i++){seriesConfig['y'+i]={'x':'x','y':'y'+i,'yAxisUnit':'someUnit'}}chart.showArrows=this._chartOptions.showArrows;chart.hideRegister=this._chartOptions.hideRegister;chart.allowNegativeValues=this._chartOptions.allowNegativeValues;chart.registerConfig={'forceDateTimeDisplay':'true','width':250};chart.toolbarConfig={'config':{'tooltipWithSearchTypes':true,'zoom':true,'pan':true}};chart.seriesConfig=seriesConfig;chart.useDegrees=true;chart.margin={'top':'0','bottom':'0','left':'10','right':'10'};chart.timeData='timeStamp';chart.renderToCanvas=this._chartOptions.canvas;if(this._chartOptions.addDynamicMenus){chart.dynamicMenuConfig=[{'name':'Dummy','action':'function(data) { console.log("dummy")}','eventName':'delete','icon':'px-vis:trash-series'}]}else{chart.dynamicMenuConfig=[]}chart.preventWebWorkerSynchronization=this._chartOptions.preventWwSync},
  _processOptionsParallel:function _processOptionsParallel(chart){chart.generateAxesFromData=true;chart.matchTicks=true;chart.seriesKey='timeStamp';chart.skipKeys={'x':true,'timeStamp':true,'category':true};chart.renderToSvg=this._chartOptions.rendToSvg;chart.hideAxisRegister=this._chartOptions.hideRegister;chart.hideCategoryRegister=this._chartOptions.hideCategoryRegister;chart.categoryKey=this._chartOptions.addCategories?'category':'';chart.categories=[0,1,2,3];if(this._chartOptions.addDynamicMenus){chart.dynamicMenuConfig=[{'name':'Dummy','action':'function(data) { console.log("dummy")}','eventName':'delete','icon':'px-vis:trash-series'}]}else{chart.dynamicMenuConfig=[]}},
  _processOptionsRadar:function _processOptionsRadar(chart,extents){chart.generateAxesFromData=true;chart.matchTicks=true;chart.seriesKey='timeStamp';chart.skipKeys={'x':true,'timeStamp':true};chart.renderToSvg=this._chartOptions.rendToSvg;chart.hideAxisRegister=this._chartOptions.hideRegister;chart.hideCategoryRegister=this._chartOptions.hideCategoryRegister;chart.categoryKey=this._chartOptions.addCategories?'category':'';chart.categories=[0,1,2,3];if(this._chartOptions.includeChartExtents){chart.chartExtents=extents}if(this._chartOptions.addDynamicMenus){chart.dynamicMenuConfig=[{'name':'Dummy','action':'function(data) { console.log("dummy")}','eventName':'delete','icon':'px-vis:trash-series'}]}else{chart.dynamicMenuConfig=[]}},
  _processOptionsPie:function _processOptionsPie(chart){}
})
