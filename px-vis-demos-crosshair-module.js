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
import '@polymer/iron-ajax/iron-ajax.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style>
      .wapper {
        display: flex;
        flex-wrap: wrap;
      }

      .minHeight {
        margin-top:25px;
        width: 45vw;
        height: 300px;
      }
    </style>
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
          }" chart-data="[[chartData]]" render-to-canvas="" crosshair-data="{{crosshairData}}">
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
          }" highlighter-config="{
            &quot;showTooltipData&quot;: &quot;true&quot;
          }" chart-data="[[chartData]]" complete-series-config="{{completeSeriesConfigXY}}" time-data="timeStamp" crosshair-data="{{crosshairData}}">
        </px-vis-xy-chart>
      </div>
      <div class="minHeight">
        <px-vis-parallel-coordinates id="para" chart-data="[[chartData]]" show-tooltip="" category-key="category" categories="[&quot;a&quot;,&quot;b&quot;,&quot;c&quot;,&quot;d&quot;]" skip-keys="{&quot;x&quot;:true}" series-key="timeStamp" match-ticks="" generate-axes-from-data="" highlighter-config="{

            &quot;showTooltipData&quot;: &quot;true&quot;
          }" axis-register-config="{
            &quot;forceDateTimeDisplay&quot;: true
          }" crosshair-data="{{crosshairData}}">
        </px-vis-parallel-coordinates>
      </div>
      <div class="minHeight">
        <px-vis-radar id="radar" show-tooltip="" chart-data="[[chartData]]" category-key="category" categories="[&quot;a&quot;,&quot;b&quot;,&quot;c&quot;,&quot;d&quot;]" skip-keys="{&quot;x&quot;:true}" series-key="timeStamp" generate-axes-from-data="" highlighter-config="{

            &quot;showTooltipData&quot;: &quot;true&quot;
          }" axis-register-config="{
            &quot;forceDateTimeDisplay&quot;: true
          }" crosshair-data="{{crosshairData}}">
        </px-vis-radar>
      </div>
      <div class="minHeight">
        <px-vis-polar id="polar" height="400" chart-data="[[chartData]]" series-config="{
            &quot;firstSerie&quot;: {
              &quot;y&quot;: &quot;y1&quot;,
              &quot;x&quot;:&quot;y0&quot;
            },
            &quot;secondSerie&quot;: {
              &quot;y&quot;: &quot;y2&quot;,
              &quot;x&quot;:&quot;y0&quot;
            }
          }" highlighter-config="{

            &quot;showTooltipData&quot;: &quot;true&quot;
          }" render-to-canvas="" crosshair-data="{{crosshairData}}" toolbar-config="{
            &quot;config&quot;: {
              &quot;crosshairWithOptions&quot;: &quot;true&quot;,
              &quot;advancedZoom&quot;: &quot;true&quot;
              }
            }" register-config="{
            &quot;forceDateTimeDisplay&quot;: true
          }" time-data="timeStamp">
        </px-vis-polar>
      </div>
    </div>
    <iron-ajax id="random1" url="[[importPath]]../px-demo-data/demo-data/random/d4x1000.json" handle-as="json" last-response="{{chartData}}" auto="">
    </iron-ajax>
`,

  is: 'px-vis-demos-crosshair-module',

  configs: {
    "timeseries": {
      config: {
        // because we are splicing in an on-click listener (which is not standard for toolbar), for each other config item, we need to clear it.
        advancedZoom: { actionConfig: { click: null, mousemove: null } },
        pan: { actionConfig: { click: null, mousemove: null } },
        tooltip: {selected: true, actionConfig: { click: null } },
        crosshairLassoTimeseries: { actionConfig: {click: null}},
        crosshair: {
          actionConfig: {
          // splice an on-click listener on the chart interaction space which just fires an event we can catch in our app
            click: function() {
              this.fire("px-freeze-crosshair");
            }
          }
        }
      }
    },
    "timeseriesFreeze": {
      config: {
        advancedZoom: { actionConfig: { click: null, mousemove: null } },
        pan: { actionConfig: { click: null, mousemove: null } },
        tooltip: {selected: true, actionConfig: { click: null } },
        // When in a frozen state, change the crosshair button into a frozen button
        frozen: {
          tooltipLabel: 'Crosshair Frozen',
          icon: 'px-vis:pin',
          eventName: "px-unfreeze-crosshair", //when the button is clicked, fire an event for the app to catch
          onClickContext: "toolbar",
          customButtonStyle: "color: salmon;" //set a custom color so it stands out
        }
      }
    },
    "xy": {
      config: {
        advancedZoom: { actionConfig: { click: null, mousemove: null } },
        pan: { actionConfig: { click: null, mousemove: null } },
        tooltip: {selected: true, actionConfig: { click: null } },
        crosshairLasso: { actionConfig: {click: null}},
        crosshairWithOptions: {
          actionConfig: {
            click: function() {
              this.fire("px-freeze-crosshair");
            }
          }
        }
      }
    },
    "xyFreeze": {
      config: {
        advancedZoom: { actionConfig: { click: null, mousemove: null } },
        pan: { actionConfig: { click: null, mousemove: null } },
        tooltip: {selected: true, actionConfig: { click: null } },
        frozen: {
          tooltipLabel: 'Crosshair Frozen',
          icon: 'px-vis:pin',
          eventName: "px-unfreeze-crosshair",
          onClickContext: "toolbar",
          customButtonStyle: "color: salmon;"
        }
      }
    },
    "paraRadar": {
      config: {
        tooltip: {selected: true, actionConfig: { click: null } },
        pan: { actionConfig: { click: null, mousemove: null } },
        axisDrag: { actionConfig: { click: null } },
        axisMuteSeries: { actionConfig: { click: null } },
        crosshairLasso: { actionConfig: {click: null}},
        crosshair: {
          actionConfig: {
            click: function() {
              this.fire("px-freeze-crosshair");
            }
          }
        }
      }
    },
    "paraRadarFreeze": {
      config: {
        tooltip: {selected: true, actionConfig: { click: null } },
        axisBrush: { actionConfig: { click: null } },
        axisDrag: { actionConfig: { click: null } },
        frozen: {
          tooltipLabel: 'Crosshair Frozen',
          icon: 'px-vis:pin',
          eventName: "px-unfreeze-crosshair",
          onClickContext: "toolbar",
          customButtonStyle: "color: salmon;"
        }
      }
    },
    "polar": {
      config: {
        tooltip: {selected: true, actionConfig: { click: null } },
        crosshairLasso: { actionConfig: {click: null}},
        crosshairWithOptions: {
          actionConfig: {
            click: function() {
              this.fire("px-freeze-crosshair");
            }
          }
        },
        advancedZoom: { actionConfig: { click: null, mousemove: 'null' } }
      }
    },
    "polarFreeze": {
      config: {
        tooltip: {selected: true, actionConfig: { click: null } },
        frozen: {
          tooltipLabel: 'Crosshair Frozen',
          icon: 'px-vis:pin',
          eventName: "px-unfreeze-crosshair",
          onClickContext: "toolbar",
          customButtonStyle: "color: salmon;"
        },
        advancedZoom: { actionConfig: { click: null, mousemove: 'null' } }
      }
    }
  },

  listeners: {
    'px-freeze-crosshair': '_freezeCrosshair',
    'px-unfreeze-crosshair': '_unfreezeCrosshair'
  },

  ready: function() {
    this.$.timeseries.set("toolbarConfig", this.configs.timeseries);
    this.$.xy.set("toolbarConfig", this.configs.xy);
    this.$.para.set("toolbarConfig", this.configs.paraRadar);
    this.$.radar.set("toolbarConfig", this.configs.paraRadar);
    this.$.polar.set("toolbarConfig", this.configs.polar);

    // make sure the origin chart draws the crosshairData
    this.$.timeseries.set("highlighterConfig.drawWithLocalCrosshairData", true);
    this.$.xy.set("highlighterConfig.drawWithLocalCrosshairData", true);
    this.$.para.set("highlighterConfig.drawWithLocalCrosshairData", true);
    this.$.radar.set("highlighterConfig.drawWithLocalCrosshairData", true);
    this.$.polar.set("highlighterConfig.drawWithLocalCrosshairData", true);

    this.$.timeseries.set("hardMute", true);
    this.$.xy.set("hardMute", true);
    this.$.para.set("hardMute", true);
    this.$.radar.set("hardMute", true);
    this.$.polar.set("hardMute", true);
  },

  _freezeCrosshair: function() {
    // Apply the freeze toolbar configs to freeze the charts
    this.$.timeseries.set("toolbarConfig", this.configs.timeseriesFreeze);
    this.$.xy.set("toolbarConfig", this.configs.xyFreeze);
    this.$.para.set("toolbarConfig", this.configs.paraRadarFreeze);
    this.$.radar.set("toolbarConfig", this.configs.paraRadarFreeze);
    this.$.polar.set("toolbarConfig", this.configs.polarFreeze);
  },

  _unfreezeCrosshair: function() {
    // define an empty dataset to clear our crosshairData
    var empty = {
      rawData: [],
      timeStamps: []
    };

    // apply our normal toolbar
    this.$.timeseries.set("toolbarConfig", this.configs.timeseries);
    this.$.xy.set("toolbarConfig", this.configs.xy);
    this.$.para.set("toolbarConfig", this.configs.paraRadar);
    this.$.radar.set("toolbarConfig", this.configs.paraRadar);
    this.$.polar.set("toolbarConfig", this.configs.polar);

    // clear our the crosshairData on all charts
    this.$.timeseries.set("crosshairData", empty);
    this.$.xy.set("crosshairData", empty);
    this.$.para.set("crosshairData", empty);
    this.$.radar.set("crosshairData", empty);
    this.$.polar.set("crosshairData", empty);
  }
});
