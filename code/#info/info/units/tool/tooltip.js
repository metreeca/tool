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

require("./tooltip.css");

var base=require("../base");
var tool=require("../base/tool");

var d3=require("d3");

module.exports=function tooltip(setup) {
	return tool(
		setup,

		function update(setup) {

			this.disabled=base.boolean(setup.disabled);
			this.visible=base.boolean(setup.visible);
			this.layer=base.node(setup.layer) || null; // the parent node for tooltips (null >> parent of enclosing svg element)

			this.anchor=base.lambda(setup.anchor) || base.nop; // the anchor point generator (datum, index):{x, y}
			this.content=base.lambda(setup.content) || base.nop;// the content generator (datum, index):node~

			this.opacity=base.number(setup.opacity, 0, 1) || 1;

			this.align=base.option(setup.align, ["none", "top", "bottom", "left", "right"]) || "none"; // alignment wrt the anchor point
			this.absolute=base.boolean(base.object(setup.absolute)); // if true anchor wrt to layer

			this.transition=base.setup(setup.transition, function (setup, transition) {

				transition.delay=base.number(setup.delay, 0) || 500; // visibility transitions delay [ms] (allows moving cursor inside tooltip)
				transition.show=base.number(setup.show) || transition.delay; // show transition delay (defaults to transition.delay)
				transition.hide=base.number(setup.hide) || transition.delay; // hide transition delay (defaults to transition.delay)
				transition.duration=base.number(setup.duration, 0) || 250; // visibility transition duration [ms]

			});

		},

		function render(nodes, self) {

			var layer=d3.select(self.layer); // !!! if null search enclosing html element

			// make sure the target layer is a positioning container

			if (layer.style("position") === "static") {
				layer.style("position", "relative");
			}


			if (self.disabled) {

				hide();

			} else {

				self(0) // clear schedule
					(self.visible ? self.transition.show : self.transition.hide) // delay action
					(self.visible ? show : hide); // modify state

			}


			function show() {

				var box=layer.node().getBoundingClientRect();

				var data=[];

				nodes.each(function (d, i) { // evaluate generators in the context of the target nodes

					var anchor=base.point(self.anchor.call(this, d, i));
					var content=base.node(self.content.call(this, d, i));

					var point; // map the anchor point to client coordinates wrt the target element (this)

					if (self.absolute) {

						point={
							x: box.left+anchor.x,
							y: box.top+anchor.y
						};

					} else if (this.ownerSVGElement !== undefined) {

						point=(this.ownerSVGElement || this).createSVGPoint();

						point.x=anchor.x;
						point.y=anchor.y;

						point=point.matrixTransform(this.getScreenCTM());

					} else {

						var area=this.getBoundingClientRect();

						point={
							x: area.left+anchor.x,
							y: area.top+anchor.y
						};

					}

					data.push({
						anchor: {x: point.x-box.left, y: point.y-box.top},
						content: content
					});
				});

				var tooltips=layer.classed("active", true).selectAll(".tooltip") // !!! select only direct children created by this specific tooltip manager

					.data(data); // !!! key? target node id?

				tooltips.enter()

					.append("div")
					.attr("class", "tooltip") // !!! mark with an id specific to this tooltip manager

					.style("position", "absolute") // position according to css properties
					.style("opacity", base.Epsilon)

					.on("mouseenter", function () { self(0); }) // cancel pending hide callback

					.on("mouseleave", function () { self(0)(self.transition.hide)(hide); })

					.on("load", function (d) {

						layout(d3.select(this), d.anchor.x, d.anchor.y);  // re-layout after images are loaded

					}, true); // load events don't bubble > capture

				tooltips.each(function (d) {

					// !!! handle undefined anchor/content

					var tooltip=d3.select(this);
					var children=d3.selectAll(this.childNodes);

					children.remove();
					tooltip.append(function () { return d.content });

					layout(tooltip, d.anchor.x, d.anchor.y);

				});
			}

			function hide() {
				layer.classed("active", false).selectAll(".tooltip") // !!! select only direct children created by this specific tooltip manager

					.transition()
					.duration(self.disabled ? 0 : self.transition.duration)

					.style("opacity", base.Epsilon)

					.transition()

					.style("left", "")
					.style("top", "")

					.remove();
			}


			function layout(tooltip, x, y) {

				// available window estate

				var vw=window.innerWidth;
				var vh=window.innerHeight;

				// compute the original geometry (use declared values)

				var node=tooltip.node();

				var ox=parseFloat(node.style.left);
				var oy=parseFloat(node.style.top);
				var ow=parseFloat(node.style.width);
				var oh=parseFloat(node.style.height);

				// absolutely positioned inline-blocks try to shrink to stay inside their parent
				// > move at top-left to avoid size effects near the bottom-right border

				tooltip

					.style("left", "0px")
					.style("top", "0px");

				// define the required alignment

				tooltip

					.classed("overflowing", false)

					.classed("left", self.align === "left")
					.classed("right", self.align === "right")
					.classed("top", self.align === "top")
					.classed("bottom", self.align === "bottom");

				// compute the preferred size

				tooltip

					.style("width", "")
					.style("height", "");

				var w=Math.min(parseFloat(tooltip.style("width")), vw);
				var h=Math.min(parseFloat(tooltip.style("height")), vh);

				// freeze the preferred size

				tooltip

					.style("width", w+"px")
					.style("height", h+"px");

				// keep inside viewport

				var area=node.getBoundingClientRect();
				var padding=5; // safety margin for shadows

				if (area.left+x < padding) {

					x=-area.left+padding;
					tooltip.classed("overflowing", true);

				} else if (area.right+x > vw-padding) {

					x=vw-area.right-padding;
					tooltip.classed("overflowing", true);

				}

				if (area.top+y < padding) {

					y=-area.top+padding;
					tooltip.classed("overflowing", true);

				} else if (area.bottom+y > vh-padding) {

					y=vh-area.bottom-padding;
					tooltip.classed("overflowing", true);

				}

				// move to the target geometry, avoiding transitions from undefined initial positions

				if (isNaN(ox) || isNaN(oy)) {

					tooltip

						.style("left", x+"px")
						.style("top", y+"px")
						.style("width", w+"px")
						.style("height", h+"px")

						.transition()
						.duration(self.transition.duration)

						.style("opacity", self.opacity);

				} else {

					tooltip

						.style("left", ox+"px")
						.style("top", oy+"px")
						.style("width", ow+"px")
						.style("height", oh+"px")

						.transition()
						.duration(self.transition.duration)

						.style("left", x+"px")
						.style("top", y+"px")
						.style("width", w+"px")
						.style("height", h+"px")

						.style("opacity", self.opacity);

				}
			}

		});
};


