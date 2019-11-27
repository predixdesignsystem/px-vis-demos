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

    <px-vis-demos-annotation counter-value="1"></px-vis-demos-annotation>

@element px-vis-demos-annotation
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

import 'px-vis/px-vis-data-converter.js';
import 'px-vis-timeseries/px-vis-timeseries.js';
import 'px-vis-xy-chart/px-vis-xy-chart.js';
import 'px-vis-parallel-coordinates/px-vis-parallel-coordinates.js';
import 'px-vis-radar/px-vis-radar.js';
import 'px-vis-polar/px-vis-polar.js';
import 'px-modal/px-modal.js';
import 'px-dropdown/px-dropdown.js';
import 'px-popover/px-popover.js';
import '@polymer/iron-ajax/iron-ajax.js';
import './helpers/tooltip-content.js';
import './css/px-vis-demos-annotation-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
Polymer({
  _template: html`
    <style include="px-vis-demos-annotation-styles"></style>
    <div class="wapper">
      <div class="minHeight">
        <px-vis-timeseries id="timeseries" disable-navigator="" series-config="{
            &quot;y0&quot;:{&quot;y&quot;:&quot;y0&quot;},
            &quot;y1&quot;:{&quot;y&quot;:&quot;y1&quot;},
            &quot;y2&quot;:{&quot;y&quot;:&quot;y2&quot;},
            &quot;y3&quot;:{&quot;y&quot;:&quot;y3&quot;}
          }" default-series-config="{
            &quot;type&quot;: &quot;line&quot;,
            &quot;x&quot;: &quot;timeStamp&quot;
          }" cursor-config="{
            &quot;horizontalLine&quot;: &quot;none&quot;
          }" highlighter-config="{
            &quot;showTooltipData&quot;: &quot;true&quot;
          }" chart-data="[[chartData]]" render-to-canvas="" crosshair-data="{{crosshairData}}" toolbar-config="{
            &quot;config&quot;: {
              &quot;advancedZoom&quot;: true,
              &quot;tooltip&quot;: true,
              &quot;pan&quot;: true
            }
          }">
        </px-vis-timeseries>
      </div>
      <div class="minHeight">
        <px-vis-xy-chart id="xy" margin="{
            &quot;top&quot;: 5,
            &quot;bottom&quot;:25,
            &quot;left&quot;:50,
            &quot;right&quot;: 10
          }" render-to-canvas="" cursor-config="{
            &quot;horizontalLine&quot;: &quot;none&quot;
          }" series-config="{
            &quot;y1&quot;:{&quot;y&quot;:&quot;y1&quot;},
            &quot;y2&quot;:{&quot;y&quot;:&quot;y2&quot;},
            &quot;y3&quot;:{&quot;y&quot;:&quot;y3&quot;}
          }" chart-extents="{
            &quot;x&quot;: [-45, -4],
            &quot;y&quot;: [-10, 20]
          }" register-config="{
            &quot;width&quot;: &quot;200&quot;,
            &quot;forceDateTimeDisplay&quot;: &quot;true&quot;
          }" default-series-config="{
            &quot;type&quot;: &quot;scatter&quot;,
            &quot;x&quot;: &quot;y0&quot;
          }" chart-data="[[chartData]]" complete-series-config="{{completeSeriesConfigXY}}" time-data="timeStamp" toolbar-config="{
            &quot;config&quot;: {
              &quot;advancedZoom&quot;: true,
              &quot;tooltip&quot;: true,

              &quot;pan&quot;: true
            }
          }">
        </px-vis-xy-chart>
      </div>
      <div class="minHeight">
        <px-vis-parallel-coordinates id="para" chart-data="[[chartData]]" category-key="category" categories="[&quot;a&quot;,&quot;b&quot;,&quot;c&quot;,&quot;d&quot;]" skip-keys="{&quot;x&quot;:true}" series-key="timeStamp" match-ticks="" generate-axes-from-data="" axis-register-config="{
            &quot;forceDateTimeDisplay&quot;: true
          }" toolbar-config="{
            &quot;config&quot;: {
              &quot;bareZoom&quot;: true,
              &quot;tooltip&quot;: true,
              &quot;pan&quot;: true,

              &quot;axisDrag&quot;: true,
              &quot;axisMuteSeries&quot;: true
            }
          }">
        </px-vis-parallel-coordinates>
      </div>
      <div class="minHeight">
        <px-vis-radar id="radar" chart-data="[[chartData]]" category-key="category" categories="[&quot;a&quot;,&quot;b&quot;,&quot;c&quot;,&quot;d&quot;]" skip-keys="{&quot;x&quot;:true}" series-key="timeStamp" generate-axes-from-data="" axis-register-config="{
            &quot;forceDateTimeDisplay&quot;: true
          }" toolbar-config="{
            &quot;config&quot;: {
              &quot;bareZoom&quot;: true,
              &quot;tooltip&quot;: true,
              &quot;pan&quot;: true,
              &quot;axisDrag&quot;: true,
              &quot;axisMuteSeries&quot;: true
            }
          }">
        </px-vis-radar>
      </div>
      <div class="minHeight" style="width:100vw; height: 800px">
        <px-vis-polar id="polar" allow-negative-values="" margin="{
          &quot;left&quot;: 100,
          &quot;top&quot;: 60,
          &quot;bottom&quot;: 40,
          &quot;right&quot;: 50
        }" toolbar-config="{
            &quot;config&quot;: {
              &quot;advancedZoom&quot;: true,
              &quot;tooltip&quot;: true,
              &quot;pan&quot;: true
            }
          }" height="400" chart-data="[[chartData]]" series-config="{
            &quot;firstSerie&quot;: {
              &quot;y&quot;: &quot;y1&quot;,
              &quot;x&quot;:&quot;y0&quot;
            },
            &quot;secondSerie&quot;: {
              &quot;y&quot;: &quot;y2&quot;,
              &quot;x&quot;:&quot;y0&quot;
            }
          }" render-to-canvas="" register-config="{
            &quot;forceDateTimeDisplay&quot;: true
          }" time-data="timeStamp">
        </px-vis-polar>
      </div>

    <px-modal id="modal" accept-text="Create" reject-text="Cancel">
      <div slot="body">
        <p>associated value: <strong>[[_readableValues]]</strong></p>
        <p>Note for series <strong>[[_seriesFound]]</strong>:</p>
        <!-- don't put closing tag on next line or textarea gets empty spaces -->
        <textarea id="modalText" value\$="{{annotationText}}"></textarea>
      </div>
    </px-modal>

    <px-tooltip id="tooltip" smart-orientation="" delay="50" orientation="top" ignore-target-events="" for="[[_ttTarget]]">
      <tooltip-content id="ttContent" edit-mode="[[editMode]]">
      </tooltip-content>
    </px-tooltip>


    <iron-ajax id="random1" url="[[importPath]]../px-demo-data/demo-data/random/d4x1000.json" handle-as="json" last-response="{{chartData}}" auto="">
    </iron-ajax>


  </div>
`,

  is:'px-vis-demos-annotation',
  properties:{currentChart:{type:Object},isRadarParallel:{type:Boolean,value:false},_seriesFound:{type:String},annotationValue:{type:Array},allCharts:{type:Array},annotationText:{type:String,value:''},_lockTooltip:{type:Boolean,value:false},_currentDataEdit:{type:Object},_editAction:{type:String,value:'cancel'},editMode:{type:Boolean,value:false},_readableValues:{type:String,computed:'_computeReadableValue(annotationValue, currentChart)'}},
  attached:function attached(){this.allCharts=[];this.allCharts.push(this.$.timeseries);this.allCharts.push(this.$.xy);this.allCharts.push(this.$.polar);this.allCharts.push(this.$.radar);this.allCharts.push(this.$.para);this.allCharts.forEach(function(element){element.addEventListener('px-vis-annotation-creation',this.createAnnotation.bind(this));element.addEventListener('px-vis-annotation-enter',this.showAnnotation.bind(this));element.addEventListener('px-vis-annotation-leave',this.hideAnnotation.bind(this));element.addEventListener('px-vis-annotation-click',this.editAnnotation.bind(this));var old=JSON.parse(JSON.stringify(element.toolbarConfig));old.config.customAnnotations={'tooltipLabel':'Annotations','icon':'px-vis:comment','cursorIcon':'px-vis:comment','buttonGroup':1,'onClick':function onClick(){this.set('_internalShowTooltip',false);this.set('showStrongIcon',true);this.set('interactionSpaceConfig.searchType','closestPoint');this.set('interactionSpaceConfig.searchFor','point')},'onDeselect':function onDeselect(){this.set('showStrongIcon',false);this.set('interactionSpaceConfig.searchFor','timestamp')},'actionConfig':{'mouseout':'resetTooltip','mousemove':'calcTooltipData','mousedown':'null','click':function click(evt){this.fire('px-vis-event-request',{'eventName':'px-vis-annotation-creation','data':{'mouseCoords':evt.mouseCoords,'clickTarget':evt.target,'chart':this}})},'mouseup':'null'},'subConfig':{'hideAnnotations':{'tooltipLabel':'Hide Annotations','icon':'px-vis:hide','buttonGroup':1,'toggle':true,'onClick':'function(button) {this.$$("px-vis-annotations").set("hide", button.selected);}'}}};element.set('toolbarConfig',old)},this);this.$.modal.addEventListener('px-modal-accepted',this.modalClose.bind(this));this.$.tooltip.addEventListener('px-tooltip-hide',this._tooltipHide.bind(this));this.$.ttContent.addEventListener('tooltip-content-save',this._saveEdit.bind(this));this.$.ttContent.addEventListener('tooltip-content-delete',this._deleteEdit.bind(this));this.$.ttContent.addEventListener('tooltip-content-cancel',this._cancelEdit.bind(this))},
  createAnnotation:function createAnnotation(evt){this.currentChart=evt.detail.data.chart;this.isRadarParallel=this.currentChart.nodeName==='PX-VIS-PARALLEL-COORDINATES'||this.currentChart.nodeName==='PX-VIS-RADAR';var mousePos=evt.detail.data.mouseCoords;if(this.isRadarParallel){this.set('_seriesFound',this.currentChart.tooltipData.series[0].name);this.annotationValue=[this._seriesFound,this.currentChart.tooltipData.series[0].value[this._seriesFound]]}else{var val;this.currentChart.tooltipData.series.forEach(function(elem){if(Object.keys(elem.value).length>0){val=elem}});this.set('_seriesFound',val.name);this.annotationValue=[val.value[this.currentChart.completeSeriesConfig[this._seriesFound].x],val.value[this.currentChart.completeSeriesConfig[this._seriesFound].y]]}this.$.modal.set('opened',true)},
  showAnnotation:function showAnnotation(evt){if(!this._lockTooltip){this.$.ttContent.annotationMessage=evt.detail.data.annotationData.data.message;this.set('_ttTarget',evt.detail.data.icon);this.$.tooltip.set('opened',true)}},
  hideAnnotation:function hideAnnotation(evt){if(!this._lockTooltip){this.$.tooltip.set('opened',false)}},
  editAnnotation:function editAnnotation(evt){this._lockTooltip=true;this.set('editMode',true);this.$.ttContent.forceTemplateRender();this.$.tooltip.setPosition();this._currentDataEdit=evt.detail.data.annotationData;this.currentChart=dom(evt).localTarget},
  modalClose:function modalClose(evt){var newData;newData={x:this.annotationValue[0],y:this.annotationValue[1],data:{message:this.$.modalText.value.trim()},series:this._seriesFound};this.currentChart.push('annotationData',newData);this.$.modalText.value=''},
  _saveEdit:function _saveEdit(evt){this._editAction='save';this._closeEdit()},
  _cancelEdit:function _cancelEdit(evt){this._editAction='cancel';this._closeEdit()},
  _deleteEdit:function _deleteEdit(evt){this._editAction='delete';this._closeEdit()},
  _closeEdit:function _closeEdit(){this.$.tooltip.set('opened',false);this.set('editMode',false);this._lockTooltip=false},
  _tooltipHide:function _tooltipHide(){var index;if(this._editAction==='save'){index=this.currentChart.annotationData.indexOf(this._currentDataEdit);this.currentChart.annotationData[index].data.message=this.$.ttContent.annotationMessage}else if(this._editAction==='delete'){index=this.currentChart.annotationData.indexOf(this._currentDataEdit);this.currentChart.splice('annotationData',index,1)}this._editAction='none'},
  _computeReadableValue:function _computeReadableValue(annotationValue,currentChart){if(annotationValue===undefined||currentChart===undefined||annotationValue.length===0){return}if(currentChart.nodeName==='PX-VIS-TIMESERIES'){return'['+Px.moment(annotationValue[0]).format()+', '+annotationValue[1].toFixed(2)+']'}else if(this.isRadarParallel){return'['+annotationValue[1].toFixed(2)+']'}else{return'['+annotationValue[0].toFixed(2)+', '+annotationValue[1].toFixed(2)+']'}}
})
