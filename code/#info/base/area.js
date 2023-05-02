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

var tool = require("./tool");

module.exports=function area(setup) {
	return tool(
		setup,

		function update(setup) {

			this.left=Math.max(0, Number(setup.left) || 0); // left margin { >= 0 } ([0..1] >> % of target area)
			this.right=Math.max(0, Number(setup.right) || 0); // right margin { >= 0 } ([0..1] >> % of target area)
			this.top=Math.max(0, Number(setup.top) || 0); // top margin { >= 0 } ([0..1] >> % of target area)
			this.bottom=Math.max(0, Number(setup.bottom) || 0); // bottom margin { >= 0 } ([0..1] >> % of target area)

			this.maxWidth=Math.max(0, Number(setup.maxWidth) || 0); // maximum width { >= 0 } (0 >> no limit)
			this.maxHeight=Math.max(0, Number(setup.maxHeight) || 0); // maximum height { >= 0} (0 >> no limit)

			this.aspect=Math.max(0, Number(setup.aspect) || 0); // aspect ratio { >= 0 } (0 >> same as target area)
			this.exact=Boolean(setup.exact) || false; // exact pixel alignment (true >> align area to fractional values)

		},

		function render(nodes) {

			var node=nodes.node() || {};
			var area={};

			var outerWidth=node.clientWidth || 0;
			var outerHeight=node.clientHeight || 0;

			var leftMargin=value(this.left, outerWidth);
			var rightMargin=value(this.right, outerWidth);
			var topMargin=value(this.top, outerHeight);
			var bottomMargin=value(this.bottom, outerHeight);

			var innerWidth=clip(outerWidth-leftMargin-rightMargin, 0, this.maxWidth || NaN);
			var innerHeight=clip(outerHeight-topMargin-bottomMargin, 0, this.maxHeight || NaN);

			var actualWidth=(this.aspect === 0) ? innerWidth : Math.min(innerWidth, innerWidth*this.aspect);
			var actualHeight=(this.aspect === 0) ? innerHeight : Math.min(innerHeight, innerHeight/this.aspect);

			area.portWidth=outerWidth;
			area.portHeight=outerHeight;

			area.width=exact(actualWidth);
			area.height=exact(actualHeight);

			area.left=exact(leftMargin+(innerWidth-area.width)/2); // center in the inner area
			area.top=exact(topMargin+(innerHeight-area.height)/2); // center in the inner area

			area.right=area.portWidth-(area.left+area.width); // no crisping
			area.bottom=area.portHeight-(area.top+area.height); // no crisping

			area.aspect=area.width/area.height; // +Infinity allowed

			return area;


			function value(value, range) {
				return value > 1 ? value : value*range;
			}

			function exact(value) {
				return this.exact ? value : Math.floor(value);
			}

			function clip(value, lower, upper) {
				return !isNaN(lower) && value < lower ? lower : !isNaN(upper) && value > upper ? upper : value;
			}

		});
};
