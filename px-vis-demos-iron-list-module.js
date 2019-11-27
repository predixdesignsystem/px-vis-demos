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

import './px-vis-iron-list.js';
import '@polymer/iron-ajax/iron-ajax.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
      <h1>Create 70 random charts with all different datasets</h1>
      <p id="text">Wainting for data to load...</p>
      <button hidden="" id="btnStart">Generate list</button>

      <iron-ajax id="randomData" url="[[importPath]]70_4k.json" handle-as="json">
      </iron-ajax>
      <px-vis-iron-list id="list"></px-vis-iron-list>
`,

  is: 'px-vis-demos-iron-list-module',

  attached: function() {
    this.$.btnStart.addEventListener('click', function() {
      if(!this.$.list.data) {
        this.$.list.set('data', this.$.randomData.lastResponse);
        this.$.btnStart.hidden = true;
      }
    }.bind(this));

    this.run();
  },

  run: function() {
    var ironAjax = this.$.randomData,
        list = this.$.list,
        text = this.$.text,
        btn = this.$.btnStart;

    ironAjax.addEventListener('last-response-changed', function(evt) {
      text.hidden = true;
      btn.hidden = false;
    });

    ironAjax.generateRequest();
  }
});
