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

require("./pie.css");

var area = require("../../base/area");
var overlay = require("../../base/overlay");
var tooltip = require("../../base/tooltip");

var base = require("../../base");
var tool = require("../../base/tool");

var d3 = require("d3");


module.exports = function pie(setup) {
	return tool(
		setup,

		function update(setup, self) {

			self.key=base.object(base.series(setup.key)); // key series
			self.item=base.object(base.string(base.series(setup.item))); // item series
			self.value=base.object(base.number(base.series(setup.value))); // value series

			self.area=base.area(setup.area) || area(); // plot area
			self.colors=base.colors(setup.colors) || d3.scale.category20c();

			self.inner=base.number(base.object(setup.inner), 0, 1) || 0; // inner radius [fraction of maximum radius]
			self.outer=base.number(base.object(setup.outer), 0, 1) || 1; // outer radius [fraction of maximum radius]

			self.start=base.number(base.object(setup.start), 0, 2*Math.PI) || 0; // start angle [radians]
			self.end=base.number(base.object(setup.end), 0, 2*Math.PI) || 2*Math.PI; // end angle [radians]

			self.label=base.string(setup.label); // chart label // !!! support node with positioning css properties

			self.transition=base.setup(setup.transition, function (setup, transition) {

				transition.duration=base.number(setup.duration, 0) || 250; // transition duration [ms] // !!! factor default

			});

			// chart controls generator node.controls(d, i):node~ (the result is positioned according to css top/bottom/left/right)

			self.controls=base.lambda(base.object(setup.controls));

			// tooltip generator node.detail(d={i, j, data, meta, item', value', startAngle, endAngle}):node~

			self.detail=base.lambda(base.object(setup.detail));

			// action handler node.action(d={i, j, data, meta, item', value', startAngle, endAngle}):boolean

			self.action=base.lambda(base.object(setup.action));


			self.tooltip=tooltip(); // the tooltip manager

		},

		function render(nodes, self) {
			nodes.each(function (data) {

				data=(data || [])

					.map(function (d, i) {
						return {

							i: i,
							j: 0,

							data: d,

							meta: {
								item: self.item,
								value: self.value
							},

							item: self.item && self.item(d, i),
							value: self.value && Math.abs(self.value(d, i)), // handle negative values

							negative: self.value && self.value(d, i) < 0

						}
					});

				data=data.filter(function (d) {

					d.startAngle=this.a;
					d.endAngle=(this.a+=(d.value || 0)*this.k);

					return !isNaN(d.value);

				}, {
					a: self.start,
					k: (self.end-self.start)/d3.sum(data, function (d) { return d.value }) || 0
				});


				var area=self.area(this);
				var radius=Math.min(area.width, area.height)/2; // !!! allocate label space

				var arc=d3.svg.arc()
					.innerRadius(self.inner*radius)
					.outerRadius(self.outer*radius);


				//// root container ////////////////////////////////////////////////////////////////////////////////

				var root=d3.select(this)

					.classed({info: true, chart: true, pie: true});

				root.selectAll(function () { return this.childNodes; }) // remove leftovers

					.filter(function () { return this.tagName.toLowerCase() !== "svg" }).remove();

				root.call(overlay, self.controls);


				//// svg chart /////////////////////////////////////////////////////////////////////////////////////

				var chart=root.selectAll("svg")

					.data(self.value ? [data] : []); // ;( show placeholder // !!! review

				chart.enter()

					.append("svg")
					.attr("preserveAspectRatio", "xMidYMid meet")

					.style("opacity", 0)

					//.transition()
					//.duration(self.transition.duration)

					.style("opacity", 1);

				chart.exit()

					//.transition()
					//.duration(self.transition.duration)

					.style("opacity", 0)

					.remove();

				chart

					.attr("width", area.portWidth)
					.attr("height", area.portHeight);


				//// plot area /////////////////////////////////////////////////////////////////////////////////////

				var plot=chart.selectAll(".plot")

					.data([data]);

				plot.enter()

					.append("g")
					.attr("class", "plot");

				plot

					.attr("transform", "translate("+(area.left+area.width/2)+","+(area.top+area.height/2)+")");


				//// slices ////////////////////////////////////////////////////////////////////////////////////////

				var slices=plot.selectAll(".slice")

					.data(data, self.key ? function (d, i) { return self.key.call(this, d.data, i)} : null);


				slices.enter()

					.append("g")
					.attr("class", "slice")

					.call(function () {

						this.append("path");
						this.append("text");

					});

				slices.exit()

					.remove();

				slices

					.classed("negative", function (d) { return d.negative })

					.call(function () {

						this.select("path")

							.style("fill", function (d, i) { return self.colors(i) })

							//.transition()
							//.duration(self.transition.duration)
							//
							//.attrTween("d", function (to) {
							//
							//	var i=d3.interpolate(this.__memo__ || {}, this.__memo__=to);
							//
							//	return function (t) { return arc(i(t)); }
							//
							//})

							.attr("d", arc)

							.on("mouseenter", function () { detail.call(this, true); })
							.on("mouseleave", function () { detail.call(this, false) })

							.on("click", function (d, i) {
								return detail.call(this, false, d3.select(this).datum()) && action.call(this, d, i); // hide details on action
							});

						this.select("text")

							.text(function (d) { return d.item })

							.each(function (d) { // label placement and trimming

								var s=d.startAngle;
								var e=d.endAngle;
								var a=(s+e)/2;

								var r=1.075*self.outer*radius;

								var cs=Math.cos(s);
								var ss=Math.sin(s);

								var ce=Math.cos(e);
								var se=Math.sin(e);

								var sa=Math.sin(a);
								var ca=Math.cos(a);

								var box=this.getBBox();

								var w=box.width/2;
								var h=box.height/2;

								var x=r*sa; // label anchor
								var y=r*ca;

								var dx=w*sa; // label offset wrt to anchor
								var dy=h*ca-h/3;

								var mw=cs*ce < 0 ? Number.POSITIVE_INFINITY : (y+dy)*(se/(ce*ce)-ss/(cs*cs))-dx;
								var mh=ss*se < 0 ? Number.POSITIVE_INFINITY : (x+dx)*(cs/(ss*ss)-ce/(se*se));

								d3.select(this)

									.attr("transform", "translate("+(x+dx)+", "+ -(y+dy)+")")

									.text(function () { // trimming

										var text=d.item || "";

										if (box.height < mh) {

											if (this.getComputedTextLength() < mw) {
												return text;
											}

											for (var n=text.length; n >= 5; --n) {
												if ((n+2)/n*this.getSubStringLength(0, n) < mw) { // +2 >> allot for …
													return text.substr(0, n)+"…";
												}
											}

										}

										return "";
									})

							});

					});


				////////////////////////////////////////////////////////////////////////////////////////////////////

				function detail(visible) {

					if (self.detail) {

						self.tooltip({

							visible: visible,
							layer: root,

							content: self.detail,

							anchor: function (d) {

								var a=(d.startAngle+d.endAngle)/2;
								var r=0.95*self.outer*radius;

								return {x: r*Math.sin(a), y: -r*Math.cos(a)}
							},

							align: "top" // !!! review (taking into account tooltip size and client viewport)

						})(this);
					}

					return true;
				}

				function action(d, i) {
					if (self.action && self.action.call(this, d, i) === false) { d3.event.preventDefault(); }
				}

			})
		}
	);
};
