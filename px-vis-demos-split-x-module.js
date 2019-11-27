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

import './px-vis-demos-ts-split-x.js';
import '@polymer/iron-ajax/iron-ajax.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <iron-ajax id="random1" url="[[importPath]]../px-demo-data/demo-data/random/d4x1000.json" handle-as="json" last-response="{{chartData}}" auto="">
    </iron-ajax>
    <px-vis-demos-ts-split-x chart-data="[[chartData]]" series-config="{
        &quot;y0&quot;:{&quot;y&quot;:&quot;y0&quot;},
        &quot;y1&quot;:{&quot;y&quot;:&quot;y1&quot;},
        &quot;y2&quot;:{&quot;y&quot;:&quot;y2&quot;},
        &quot;y3&quot;:{&quot;y&quot;:&quot;y3&quot;}
      }" default-series-config="{
        &quot;type&quot;: &quot;line&quot;,
        &quot;x&quot;: &quot;timeStamp&quot;
      }">
    </px-vis-demos-ts-split-x>
`,

  is: 'px-vis-demos-split-x-module'
});
