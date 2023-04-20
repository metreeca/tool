/*
 * Copyright © 2020-2023 Metreeca srl
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

// A D3.js plugin for overlaying content to a selection

var base=require("../base");

var d3=require("d3");

module.exports=function overlay(selection, generator) {

	selection=base.nodes(selection);
	generator=base.lambda(generator);

	if (selection && generator) {
		selection.each(function (datum, index) {

			var overlay=base.nodes(generator.call(this, datum, index));
			var target=base.nodes(this); // !!! if overlay is html and this is svg search the enclosing html element

			// make sure the target is a positioning container

			if (target.style("position") === "static") {
				target.style("position", "relative");
			}

			// position overlay according to its css top/bottom/left/right properties

			overlay.style("position", "absolute");

			target.append(function () { return overlay.node(); });

		});
	}

	return selection;

};
