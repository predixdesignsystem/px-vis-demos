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
/*
    Relative paths assume component is being run from inside an app or another component, where dependencies are flat
    siblings. When this component is run from its own repo (e.g. tests, examples), we assume the server is started with
    'gulp serve' (or similar server setup) to enable correct finding of bower dependencies for local runs.
*/
/**
REPLACE THIS TEXT WITH A COMPONENT DESCRIPTION

### Usage

    <px-vis-demos-ts-split-x counter-value="1"></px-vis-demos-ts-split-x>

@element px-vis-demos-ts-split-x
@blurb REPLACE THIS TEXT WITH A COMPONENT DESCRIPTION
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
import '@polymer/iron-list/iron-list.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <!-- <style include="px-vis-demos-ts-split-x-styles"></style> -->
    <iron-list items="[[_internalData]]" as="item" style="height: 100vh">
      <template>
        <div>
          <template is="dom-if" if="[[item.isTimeseries]]">
            <px-vis-timeseries chart-data="[[item.chartData]]" series-config="[[item.seriesConfig]]" chart-extents="[[item.chartExtents]]" disable-navigator="" height="300" render-to-canvas="" draw-debounce-time="{
                &quot;chartData&quot;: 150,
                &quot;filteredChartData&quot;: 150,
                &quot;highlightData&quot;: 10,
                &quot;markers&quot;: 10
              }">
            </px-vis-timeseries>
          </template>
          <template is="dom-if" if="[[item.isXY]]">
            <px-vis-xy-chart chart-data="[[item.chartData]]" series-config="[[item.seriesConfig]]" chart-extents="[[item.chartExtents]]" height="300" margin="{&quot;bottom&quot;: 25, &quot;left&quot;: 40}" render-to-canvas="" draw-debounce-time="{
                &quot;chartData&quot;: 150,
                &quot;filteredChartData&quot;: 150,
                &quot;highlightData&quot;: 10,
                &quot;markers&quot;: 10
              }" prevent-web-worker-synchronization="">
            </px-vis-xy-chart>
          </template>
          <template is="dom-if" if="[[item.isPolar]]">
              <div style="height: 300px">
                <px-vis-polar chart-data="[[item.chartData]]" series-config="[[item.seriesConfig]]" chart-extents="[[item.chartExtents]]" render-to-canvas="" draw-debounce-time="{
                    &quot;chartData&quot;: 150,
                    &quot;filteredChartData&quot;: 150,
                    &quot;highlightData&quot;: 10,
                    &quot;markers&quot;: 10
                  }">
                </px-vis-polar>
              </div>
            </template>
        </div>
      </template>
    </iron-list>
`,

  is:'px-vis-iron-list',
  properties:{data:{type:Object,observer:'_dataChanged'},_internalData:{type:Object}},
  _dataChanged:function _dataChanged(){var result=[],newItem,rand;for(var i=0;i<this.data.length;i++){newItem={};rand=Math.random();newItem.chartData=this.data[i].data;if(rand<0.4){newItem.isTimeseries=true;newItem.chartExtents={x:this.data[i].extents.x,y:this.data[i].extents.y};newItem.seriesConfig=this._generateConfigTS()}else if(rand<0.8){newItem.isXY=true;newItem.chartExtents={x:[0,999],y:this.data[i].extents.y};newItem.seriesConfig=this._generateConfigXYPolar(false)}else{newItem.isPolar=true;newItem.chartExtents={y:this.data[i].extents.y};newItem.seriesConfig=this._generateConfigXYPolar(true)}result.push(newItem)}this.set('_internalData',result)},
  _generateConfigXYPolar:function _generateConfigXYPolar(polar){var symbol=Math.random()>0.5?'square':'diamond';return{y0:{type:'scatter',x:'x',y:'y0',markerSymbol:symbol,markerSize:polar?8:64},y1:{type:'scatter',x:'x',y:'y1',markerSymbol:symbol,markerSize:polar?8:64},y2:{type:'scatter',x:'x',y:'y2',markerSymbol:symbol,markerSize:polar?8:64},y3:{type:'scatter',x:'x',y:'y3',markerSymbol:symbol,markerSize:polar?8:64}}},
  _generateConfigTS:function _generateConfigTS(){return{y0:{x:'t',y:'y0'},y1:{x:'t',y:'y1'},y2:{x:'t',y:'y2'},y3:{x:'t',y:'y3'}}}
})
