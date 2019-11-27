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
import './css/px-vis-demos-ts-split-x-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style include="px-vis-demos-ts-split-x-styles"></style>
    <div class="minHeight flex">
        <div class\$="[[_getMainClass(splitEnabled)]]">
          <px-vis-timeseries id="main" disable-navigator="" series-config="[[seriesConfig]]" default-series-config="[[defaultSeriesConfig]]" chart-data="[[chartData]]" render-to-canvas="" margin="{&quot;left&quot;: 0, &quot;right&quot;:1 , &quot;top&quot;: 0, &quot;bottom&quot;:40}" tooltip-data="{{tooltipData}}" action-config="[[actionConfig]]">
          </px-vis-timeseries>
        </div>
        <template is="dom-if" id="subIf" if="[[splitEnabled]]">
          <div class="flex__item half">
            <px-vis-timeseries id="sub" disable-navigator="" series-config="[[seriesConfig]]" default-series-config="[[defaultSeriesConfig]]" chart-data="[[chartData]]" render-to-canvas="" toolbar-config="[[dismissConfig]]" margin="{&quot;left&quot;: 1, &quot;right&quot;:0 , &quot;top&quot;: 0, &quot;bottom&quot;:40}" tooltip-data="[[fakeTooltipData]]" action-config="{{actionConfig}}">
            </px-vis-timeseries>
          </div>
        </template>
      </div>
`,

  is:'px-vis-demos-ts-split-x',
  properties:{chartData:{type:Object},seriesConfig:{type:Object},defaultSeriesConfig:{type:Object},splitEnabled:{type:Boolean,value:false},actionConfig:{type:Object},tooltipData:{type:Object},fakeTooltipData:{type:Object,computed:'_fakeTooltipData(tooltipData)'},splitConfig:{type:Object,value:function value(){return{'config':{'advancedZoom':true,'pan':true,'tooltip':true,'splitZoom':{'icon':'px-utl:zoom','buttonGroup':5,'tooltipLabel':'Split zoom','selectable':true,'actionConfig':{'mousedown':this.splitZoomStart.bind(this),'mouseup':this.splitZoomEnd.bind(this),'mousemove':this.splitZoomMove.bind(this)}}}}}},dismissConfig:{type:Object,value:function value(){return{'config':{'advancedZoom':true,'pan':true,'tooltip':true,'dismiss':{'icon':'px-nav:close','tooltipLabel':'close split zoom view','onClick':this.closeSplitZoom.bind(this)}}}}},zoomState:{type:Object,value:function value(){return{'isZooming':false,'domains':[],'domainsIndex':-1}}},rects:{type:Array,value:function value(){return[]}},oldExtents:{type:Object}},
  attached:function attached(){this.$.main.set('toolbarConfig',this.splitConfig)},
  _checkThemeVariable:function _checkThemeVariable(varName,defaultValue){var themeVar=this.getComputedStyleValue(varName);return!themeVar||themeVar.length===0?defaultValue:themeVar},
  splitZoomStart:function splitZoomStart(evt){this.zoomState.isZooming=true;this.zoomState.domains.push([this.$.main.x.invert(evt.mouseCoords[0])]);this.zoomState.domainsIndex++;Px.d3.select(document).on('mouseup.action',this.splitZoomEnd.bind(this));var startX=evt.mouseCoords[0],startY=0;this.rects.push(this.$.main.svgLower.append('rect').attr('class','action-area').attr('x',startX).attr('y',startY).attr('ox',startX).attr('rx',2).attr('width',0).attr('height',evt.target.getAttribute('height')).attr('fill',this._checkThemeVariable('--px-vis-zoom-brush-fill-color','rgb(0,0,0)')).attr('fill-opacity',this._checkThemeVariable('--px-vis-zoom-brush-fill-opacity',0.5)).attr('stroke',this._checkThemeVariable('--px-vis-zoom-brush-outline-color','rgb(0,0,0)')))},
  splitZoomEnd:function splitZoomEnd(evt){this.zoomState.isZooming=false;Px.d3.select(document).on('mouseup.action',null);if(this.zoomState.domains[this.zoomState.domains.length-1]){this.zoomState.domains[this.zoomState.domains.length-1].sort(function(a,b){return a-b})}if(this.zoomState.domains.length===2){this.applySplitZoom();for(var i=0;i<this.rects.length;i++){if(this.rects[i]&&this.rects[i].remove){this.rects[i].remove()}}this.rects=[]}},
  splitZoomMove:function splitZoomMove(evt){if(this.zoomState.isZooming){var ox=parseInt(this.rects[this.zoomState.domainsIndex].attr('ox')),newX=Math.max(Math.min(evt.mouseCoords[0],1000),0);if(newX>=ox){this.rects[this.zoomState.domainsIndex].attr('x',ox);this.rects[this.zoomState.domainsIndex].attr('width',newX-ox)}else{this.rects[this.zoomState.domainsIndex].attr('x',newX);this.rects[this.zoomState.domainsIndex].attr('width',ox-newX)}this.zoomState.domains[this.zoomState.domains.length-1][1]=this.$.main.x.invert(evt.mouseCoords[0])}},
  closeSplitZoom:function closeSplitZoom(evt){this.$.main.classList.remove('half');this.set('splitEnabled',false);this.$.main.set('toolbarConfig',this.splitConfig);this.$.main.set('hideRegister',false);this.$.main.set('chartExtents',{x:this.oldExtents});this.zoomState={'isZooming':false,'domains':[],'domainsIndex':-1};var oldDebounceTiming=this.$.main.debounceResizeTiming;this.$.main.debounceResizeTiming=0;this.$.main.notifyResize();this.$.main.debounceResizeTiming=oldDebounceTiming},
  applySplitZoom:function applySplitZoom(){this.splitZooming=false;console.log('stop split');this.set('splitEnabled',true);this.$.main.classList.add('half');if(!this.$.sub){this.$.subIf.render();this.$.sub=this.$$('#sub')}if(this.zoomState.domains[0][0]>this.zoomState.domains[1][0]){var tmp=this.zoomState.domains.shift();this.zoomState.domains.push(tmp)}this.oldExtents=this.$.main.x.domain();this.$.main.set('chartExtents',{x:this.zoomState.domains[0]});this.$.sub.set('chartExtents',{x:this.zoomState.domains[1]});this.$.main.set('toolbarConfig',this.dismissConfig);this.$.main.set('hideRegister',true);this.$.main.debounceResizeTiming=0;this.$.sub.debounceResizeTiming=0;this.$.main.notifyResize();this.$.sub.notifyResize();this.$.main.debounceResizeTiming=250;this.$.sub.debounceResizeTiming=250},
  _getMainClass:function _getMainClass(splitEnabled){return splitEnabled?'flex__item half':'flex__item full'},
  _fakeTooltipData:function _fakeTooltipData(tooltipData){var result={series:[]};for(var i=0;i<tooltipData.series.length;i++){result.series.push({'name':tooltipData.series[i].name,'value':tooltipData.series[i].value,'coord':[-999,-999]})}result.time=tooltipData.time;return result}
})
