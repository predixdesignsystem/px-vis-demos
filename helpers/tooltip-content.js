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

### Usage




@element px-vis-markers
@blurb Element which draws markers on top or bottom of a chart
@homepage index.html
@demo demo/index.html

*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import '../css/tooltip-content-styles.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style include="tooltip-content-styles"></style>

    <div style="pointer-events:all">
      <template id="templateView" is="dom-if" if="[[!editMode]]">
        <div>[[annotationMessage]]</div>
      </template>
      <template id="templateEdit" is="dom-if" if="[[editMode]]">
        <!-- don't put closing tag on next line or textarea gets empty spaces -->
        <textarea id="ttEditText" value="{{annotationMessage::input}}" style="width: 380px; height:100px"></textarea>
        <div style="display: flex; flex-direction:row-reverse">
          <button id="ttOk" class="btn btn--call-to-action u-ml-" on-click="_saveEdit">Save</button>
          <button id="ttDelete" class="btn" on-click="_deleteEdit">Delete</button>
          <button id="ttCancel" class="btn" on-click="_cancelEdit">Cancel</button>
        </div>
      </template>
    </div>
`,

  is: 'tooltip-content',

  /**
   * Properties block, expose attribute values to the DOM via 'reflect'
   *
   * @property properties
   * @type Object
   */
  //properties
  properties: {
    annotationMessage: {
      type: String,
      value: ''
    },

    editMode: {
      type: Boolean,
      value: false
    }

  },

  _saveEdit: function(evt) {
    this.fire('tooltip-content-save');
  },

  _cancelEdit: function(evt) {
    this.fire('tooltip-content-cancel');
  },

  _deleteEdit: function(evt) {
    this.fire('tooltip-content-delete');
  },

  forceTemplateRender: function() {
    this.$.templateEdit.render();
    this.$.templateView.render();
  }
});
