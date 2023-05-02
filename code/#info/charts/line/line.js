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

require("./line.css");

var area = require("../../base/area");
var overlay = require("../../base/overlay");
var tooltip = require("../../base/tooltip");

var base = require("../../base");
var chart = require("../../base/chart");

var d3 = require("d3");

module.exports = function line(setup) {
	return chart(
		setup,

		function update(setup, self) {

			self.key=base.object(base.series(setup.key)); // key series

			self.item=base.object(base.string(base.series(setup.item))); // item series

			self.x=base.object(base.number(base.series(setup.x))); // x series
			self.y=base.array(base.number(base.series(setup.y))) || []; // y series

			self.area=base.area(setup.area) || area(); // plot area
			self.colors=base.colors(setup.colors) || d3.scale.category10();

			self.abscissa=base.setup(setup.abscissa, function (setup, abscissa) { // horizontal axis

				abscissa.origin=base.boolean(base.object(setup.origin)) || false; // show the origin of the axis?
				abscissa.label=base.string(base.object(setup.label)) || "";
				abscissa.offset=base.number(base.object(setup.offset)) || 0; // axis offset from the charting area [px]
				abscissa.grid=base.boolean(base.object(setup.grid)) || false; // display vertical grid lines?
				abscissa.hair=base.boolean(base.object(setup.hair)) || false; // display vertical hair lines?

				abscissa.scale=d3.scale.linear().nice();
				abscissa.axis=d3.svg.axis().scale(abscissa.scale);

			});

			self.ordinate=base.setup(setup.ordinate, function (setup, ordinate) { // vertical axis

				ordinate.origin=base.boolean(base.object(setup.origin)); // show the origin of the axis?
				ordinate.label=base.string(base.object(setup.label)) || "";
				ordinate.offset=base.number(base.object(setup.offset)) || 0; // axis offset from the charting area [px]
				ordinate.grid=base.boolean(base.object(setup.grid)); // display horizontal grid lines?
				ordinate.hair=base.boolean(base.object(setup.hair)); // display horizontal hair lines?

				ordinate.scale=d3.scale.linear().nice();
				ordinate.axis=d3.svg.axis().scale(ordinate.scale);

			});

			self.transition=base.setup(setup.transition, function (setup, transition) {

				transition.duration=base.number(setup.duration, 0) || 250; // transition duration [ms] // !!! factor default

			});

			// chart controls generator node.controls(d, i):node~ (the result is positioned according to css top/bottom/left/right)

			self.controls=base.lambda(base.object(setup.controls));

			// tooltip generator node.detail(cell={i, j, data, meta, x', y', item'}):node~

			self.detail=base.lambda(base.object(setup.detail));

			// action handler node.action(d={i, j, data, meta, x', y', item'}):boolean

			self.action=base.lambda(base.object(setup.action));

			self.tooltip=tooltip(); // the tooltip manager
		},

		function render(nodes, self) {
			nodes.each(function (data) {

				data=(data || []);

				var xmin=d3.min(data, function (datum, index) { return self.x && self.x(datum, index) }) || 0;
				var xmax=d3.max(data, function (datum, index) { return self.x && self.x(datum, index) }) || 0;

				var ymin=d3.min(data, function (datum, index) {
					return d3.min(self.y.map(function (y) { return y(datum, index); })) || 0;
				});

				var ymax=d3.max(data, function (datum, index) {
					return d3.max(self.y.map(function (y) { return y(datum, index); })) || 0;
				});


				var area=self.area(this);
				var width=area.width;
				var height=area.height;

				// !!! altering setup object will break callbacks when drawing multiple charts

				var xScale=self.abscissa.scale
					.domain(self.abscissa.origin ? [Math.min(0, xmin), Math.max(0, xmax)] : [xmin, xmax])
					.range([0, width]);

				var yScale=self.ordinate.scale
					.domain(self.ordinate.origin ? [Math.min(0, ymin), Math.max(0, ymax)] : [ymin, ymax])
					.range([height, 0]);

				var xAxis=self.abscissa.axis
					.orient("bottom")
					.tickFormat(null); // !!! review

				var yAxis=self.ordinate.axis
					.orient("left")
					.tickFormat(null); // !!! review

				var colorScale=self.colors
					.domain(self.y);


				//// root container ////////////////////////////////////////////////////////////////////////////////

				var root=d3.select(this)

					.classed({info: true, chart: true, line: true});

				root.selectAll(function () { return this.childNodes; }) // remove leftovers

					.filter(function () { return this.tagName.toLowerCase() !== "svg" }).remove();

				root.call(overlay, self.controls);


				//// svg chart /////////////////////////////////////////////////////////////////////////////////////

				var chart=root.selectAll("svg")

					.data([data]);

				chart.enter()

					.append("svg")
					.attr("preserveAspectRatio", "xMidYMid meet");

				chart

					.attr("width", area.portWidth)
					.attr("height", area.portHeight);


				//// plot area /////////////////////////////////////////////////////////////////////////////////////

				var plot=chart.selectAll(".plot")

					.data([data]);

				plot.enter()

					.append("g")
					.attr("class", "plot")

					.call(function () {

						this.append("line")

							.attr("class", "abscissa hair")
							.style("opacity", 0);

						this.append("line")

							.attr("class", "ordinate hair")
							.style("opacity", 0);
					});

				plot

					.attr("transform", "translate("+area.left+","+area.top+")");


				//// horizontal axis ///////////////////////////////////////////////////////////////////////////////

				var abscissa=plot.selectAll(".abscissa.axis")

					.data([data]);

				abscissa.enter()

					.append("g")
					.attr("class", "abscissa axis")

					.call(function () {
						this
							.append("text")
							.attr("class", "label")
							.attr("dy", ".71em")
					});

				abscissa

					.attr("transform", "translate(0,"+(ymin*ymax < 0 ? yScale(0) : height+self.abscissa.offset)+")")

					.call(xAxis)

					.call(function () { // slant axis labels

						// !!!
						//var labels=this.selectAll(".tick text");
						//
						//var fit=labels.filter(function () {
						//	return this.getComputedTextLength() > xScale.rangeBand();
						//}).empty();
						//
						//if ( self.orient === "vertical" && !fit ) {
						//
						//	labels
						//
						//			.style("text-anchor", "end")
						//			.attr("dx", "-.8em")
						//			.attr("dy", ".15em")
						//			.attr("transform", function () { return "rotate(-35)" })
						//
						//} else {
						//
						//	labels.attr("transform", null)
						//
						//}

					});

				abscissa.select(".label")

					.attr("x", width)
					.attr("y", -15)
					.style("text-anchor", "end")
					.text(self.abscissa.label);

				var ordinate=plot.selectAll(".ordinate.axis")

					.data([data]);


				//// horizontal grid ///////////////////////////////////////////////////////////////////////////////

				var xgrid=plot.selectAll(".major.x.grid")

					.data(self.abscissa.grid ? yScale.ticks() : []);

				xgrid.enter()

					.insert("line", ":first-child"); // under other existing elements

				xgrid.exit()

					.remove();

				xgrid

					.attr({
						class: "major x grid",
						x1: 0,
						x2: width+yAxis.innerTickSize(),
						y1: function (d) { return yScale(d) },
						y2: function (d) { return yScale(d) }
					});


				//// vertical axis /////////////////////////////////////////////////////////////////////////////////

				ordinate.enter()

					.append("g")
					.attr("class", "ordinate axis")

					.call(function () {
						this.append("text")
							.attr("class", "label")
							.attr("dy", ".71em");
					});

				ordinate

					.attr("transform", "translate(-"+(xmin*xmax < 0 ? xScale(0) : self.ordinate.offset)+", 0)")

					.call(yAxis);

				ordinate.select(".label")

					.attr("y", 6)
					.attr("transform", "rotate(-90)")

					.style("text-anchor", "end")
					.text(self.ordinate.label);


				//// vertical grid ///////////////////////////////////////////////////////////////////////////////

				var ygrid=plot.selectAll(".major.y.grid")

					.data(self.ordinate.grid ? xScale.ticks() : []);

				ygrid.enter()

					.insert("line", ":first-child"); // under other existing elements

				ygrid.exit()

					.remove();

				ygrid

					.attr({
						class: "major y grid",
						x1: function (d) { return xScale(d) },
						x2: function (d) { return xScale(d) },
						y1: 0-xAxis.innerTickSize(),
						y2: height
					});


				//// series lines //////////////////////////////////////////////////////////////////////////////////

				var series=plot.selectAll(".series")

					.data(self.y.map(function (y, j) {

						return data.map(function (d, i) {

							return {

								i: i,
								j: j,

								data: d,

								meta: {

									item: self.item,

									x: self.x,
									y: y
								},

								item: self.item && self.item(d, i),

								x: self.x && self.x(d, i),
								y: y && y(d, i)
							}

						}).sort(function (a, b) { // make sure x values are sorted
							return (a.x || 0)-(b.x || 0)
						})

					}), function (d, i) {
						return self.y[i]
					});

				series.enter()

					.insert("g")
					.attr("class", "series")

					.call(function () {
						this.append("path")
							.attr("class", "line");
					});

				series.exit()

					.remove();

				series.each(function (d, i) {
					d3.select(this).select(".line")

						.attr("d", d3.svg.line()

							.defined(defined)

							.x(function (d) { return xScale(d.x) })
							.y(function (d) { return yScale(d.y) }))

						.attr("fill", "none")
						.attr("stroke", function () { return colorScale(self.y[i]) });

				});


				//// series markers /////////////////////////////////////////////////////////////////////////////////

				var markers=series.selectAll(".marker") // !!! configurable

					.data(function (d) { return d.filter(defined) });

				markers.enter()

					.append("path")
					.attr("class", "marker");

				markers.exit()

					.remove();

				markers

					.attr("transform", function (d) { return "translate("+xScale(d.x)+","+yScale(d.y)+")"; })

					.attr("d", d3.svg.symbol().type("circle").size(20)) // !!! configurable size/type
					.attr("fill", function (d) { return colorScale(d.meta.y) })

					.on("mouseenter", function () { return detail.call(this, true, d3.select(this).datum()) })
					.on("mouseleave", function () { return detail.call(this, false, d3.select(this).datum()) })

					.on("click", function (d, i) {
						return detail.call(this, false, d3.select(this).datum()) && action.call(this, d, i); // hide details on action
					});


				////////////////////////////////////////////////////////////////////////////////////////////////////

				function defined(cell) {
					return !isNaN(cell.x) && !isNaN(cell.y)
				}


				function detail(visible, d) {

					chart.select(".abscissa.hair")

						.style("opacity", visible && self.abscissa.hair ? 1 : 0)

						.attr({
							x1: xScale(d.x),
							x2: xScale(d.x),
							y1: 0-self.abscissa.offset,
							y2: height+self.abscissa.offset
						});

					chart.select(".ordinate.hair")

						.style("opacity", visible && self.ordinate.hair ? 1 : 0)

						.attr({
							x1: 0-self.ordinate.offset,
							x2: width+self.ordinate.offset,
							y1: yScale(d.y),
							y2: yScale(d.y)
						});

					if (self.detail) {
						self.tooltip({

							visible: visible,
							layer: root,

							content: self.detail,

							anchor: function () { return {x: 12, y: 0} }, // coordinate with .marker in line.css
							align: "right"

						})(this);
					}

					return true;
				}

				function action(d, i) {
					if (self.action && self.action.call(this, d, i) === false) { d3.event.preventDefault(); }
				}
			});
		}
	);
};
