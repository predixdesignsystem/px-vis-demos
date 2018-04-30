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

'use strict';(function(){Polymer({is:'px-vis-iron-list',properties:{data:{type:Object,observer:'_dataChanged'},_internalData:{type:Object}},_dataChanged:function _dataChanged(){var result=[],newItem,rand;for(var i=0;i<this.data.length;i++){newItem={};rand=Math.random();newItem.chartData=this.data[i].data;if(rand<0.4){newItem.isTimeseries=true;newItem.chartExtents={x:this.data[i].extents.x,y:this.data[i].extents.y};newItem.seriesConfig=this._generateConfigTS()}else if(rand<0.8){newItem.isXY=true;newItem.chartExtents={x:[0,999],y:this.data[i].extents.y};newItem.seriesConfig=this._generateConfigXYPolar(false)}else{newItem.isPolar=true;newItem.chartExtents={y:this.data[i].extents.y};newItem.seriesConfig=this._generateConfigXYPolar(true)}result.push(newItem)}this.set('_internalData',result)},_generateConfigXYPolar:function _generateConfigXYPolar(polar){var symbol=Math.random()>0.5?'square':'diamond';return{y0:{type:'scatter',x:'x',y:'y0',markerSymbol:symbol,markerSize:polar?8:64},y1:{type:'scatter',x:'x',y:'y1',markerSymbol:symbol,markerSize:polar?8:64},y2:{type:'scatter',x:'x',y:'y2',markerSymbol:symbol,markerSize:polar?8:64},y3:{type:'scatter',x:'x',y:'y3',markerSymbol:symbol,markerSize:polar?8:64}}},_generateConfigTS:function _generateConfigTS(){return{y0:{x:'t',y:'y0'},y1:{x:'t',y:'y1'},y2:{x:'t',y:'y2'},y3:{x:'t',y:'y3'}}}})})();
//# sourceMappingURL=px-vis-iron-list.js.map
