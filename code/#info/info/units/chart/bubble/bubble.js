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

require("src/main/node.js/info/units/chart/bubble/bubble.css");

var area=require("src/main/node.js/info/units/tool/area");
var overlay=require("src/main/node.js/info/units/tool/overlay");
var tooltip=require("src/main/node.js/info/units/tool/tooltip");

var base=require("src/main/node.js/info/units/base");
var chart=require("src/main/node.js/info/units/base/chart");

var d3=require("d3");

module.exports=function line(setup) {
    return chart(
        setup,

        function update(setup, self) {

            self.key=base.object(base.series(setup.key)); // key series

            self.item=base.object(base.string(base.series(setup.item))); // item series
            self.group=base.object(base.string(base.series(setup.group))); // group series

            self.x=base.object(base.number(base.series(setup.x))); // x series
            self.y=base.object(base.number(base.series(setup.y))); // y series
            self.z=base.object(base.number(base.series(setup.z))); // z series

            self.area=base.area(setup.area) || area(); // plot area
            self.colors=base.colors(setup.colors) || d3.scale.category10();

            self.abscissa=base.setup(setup.abscissa, function (setup, abscissa) { // horizontal axis

                abscissa.origin=base.boolean(base.object(setup.origin)) || false; // if true show the origin of the axis
                abscissa.label=base.string(base.object(setup.label)) || "";
                abscissa.offset=base.number(base.object(setup.offset)) || 0; // axis offset from the charting area [px]
                abscissa.grid=base.boolean(base.object(setup.grid)) || false; // display vertical grid lines?
                abscissa.hair=base.boolean(base.object(setup.hair)) || false; // display vertical hair lines?

                abscissa.scale=d3.scale.linear().nice();
                abscissa.axis=d3.svg.axis();

            });

            self.ordinate=base.setup(setup.ordinate, function (setup, ordinate) { // vertical axis

                ordinate.origin=base.boolean(base.object(setup.origin)); // if true show the origin of the axis
                ordinate.label=base.string(base.object(setup.label)) || "";
                ordinate.offset=base.number(base.object(setup.offset)) || 0; // axis offset from the charting area [px]
                ordinate.grid=base.boolean(base.object(setup.grid)); // display horizontal grid lines?
                ordinate.hair=base.boolean(base.object(setup.hair)); // display horizontal hair lines?

                ordinate.scale=d3.scale.linear().nice();
                ordinate.axis=d3.svg.axis();

            });

            self.radius=base.setup(setup.radius, function (setup, radius) {

                radius.min=base.number(base.object(setup.min), 0) || 5; // minimum bubble radius [f/px] { >= 0, [0..1] >> % of target area }
                radius.max=base.number(base.object(setup.max), 0) || 50; // maximum bubble radius [f/px] { >= 0, [0..1] >> % of target area }

                radius.scale=d3.scale.linear();

            });

            self.transition=base.setup(setup.transition, function (setup, transition) {

                transition.duration=base.number(setup.duration, 0) || 250; // transition duration [ms] // !!! factor default

            });

            // chart controls generator node.controls(d, i):node~ (the result is positioned according to css top/bottom/left/right)

            self.controls=base.lambda(base.object(setup.controls));

            // tooltip generator node.detail(cell={i, j, data, meta, x', y', z', item', group'}):node~

            self.detail=base.lambda(base.object(setup.detail));

            // action handler node.action(d={i, j, data, meta, x', y', z', item', group'}):boolean

            self.action=base.lambda(base.object(setup.action));

            self.tooltip=tooltip(); // the tooltip manager
        },

        function render(nodes, self) {
            nodes.each(function (data) {

                data=data || [];

                var area=self.area(this);
                var width=area.width;
                var height=area.height;

                var xext=d3.extent(data, function (d, i) { return self.x && self.x(d, i) });
                var xmin=xext[0] || 0;
                var xmax=xext[1] || 0;

                var yext=d3.extent(data, function (d, i) { return self.y && self.y(d, i) });
                var ymin=yext[0] || 0;
                var ymax=yext[1] || 0;

                var zext=d3.extent(data, function (d, i) { return self.z && self.z(d, i) });
                var zmin=zext[0] || 0;
                var zmax=zext[1] || 0;

                var rmin=(self.radius.min > 1 ? self.radius.min : self.radius.min*Math.min(width, height));
                var rmax=(self.radius.max > 1 ? self.radius.max : self.radius.max*Math.min(width, height));

                // adjust domains to allocate space for bubbles

                var dr=2.5*rmax;
                var dx=(xmax-xmin), kx=dx*dr/(width-dr)/2;
                var dy=(ymax-ymin), ky=dy*dr/(height-dr)/2;

                // !!! xmin-=kx;
                xmax+=kx;

                // !!! ymin-=ky;
                ymax+=ky;

                // !!! altering setup object will break callbacks when drawing multiple charts

                var xScale=self.abscissa.scale
                    .domain(self.abscissa.origin ? [Math.min(0, xmin), Math.max(0, xmax)] : [xmin, xmax])
                    .range([0, width]);

                var yScale=self.ordinate.scale
                    .domain(self.ordinate.origin ? [Math.min(0, ymin), Math.max(0, ymax)] : [ymin, ymax])
                    .range([height, 0]);

                var zScale=self.radius.scale
                    .domain([0, Math.max(Math.abs(zmin), Math.abs(zmax))])
                    .range([rmin, rmax]);

                var colorScale=self.colors
                    .domain(self.group || []);

                var xAxis=self.abscissa.axis
                    .scale(xScale)
                    .orient("bottom")
                    .tickFormat(null); // !!! review

                var yAxis=self.ordinate.axis
                    .scale(yScale)
                    .orient("left")
                    .tickFormat(null); // !!! review


                //// root container ////////////////////////////////////////////////////////////////////////////////

                var root=d3.select(this)

                    .classed({info: true, chart: true, bubble: true});

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

                    .call(function () {

                        this.select(".label")

                            .attr("x", width)
                            .attr("y", -15)
                            .style("text-anchor", "end")
                            .text(self.abscissa.label);

                    })

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


                //// vertical axis //////////////////////////////////////////////////////////////////////////////////

                var ordinate=plot.selectAll(".ordinate.axis")

                    .data([data]);

                ordinate.enter()

                    .append("g")
                    .attr("class", "ordinate axis")

                    .call(function () {
                        this.append("text")
                            .attr("class", "label")
                            .attr("dy", ".71em");
                    });

                ordinate

                    .attr("transform", "translate("+(xmin*xmax < 0 ? xScale(0) : self.ordinate.offset)+", 0)")

                    .call(yAxis)

                    .call(function () {
                        this.select(".label")

                            .attr("y", 6)
                            .attr("transform", "rotate(-90)")

                            .style("text-anchor", "end")
                            .text(self.ordinate.label);
                    });


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


                //// bubbles ///////////////////////////////////////////////////////////////////////////////////////

                var bubbles=plot.selectAll(".bubble")

                    .data(data.map(function (d, i) {

                        return {

                            i: i,
                            j: 0,

                            data: d,

                            meta: {

                                x: self.x,
                                y: self.y,
                                z: self.z,

                                item: self.item,
                                group: self.group
                            },

                            x: self.x && self.x(d, i),
                            y: self.y && self.y(d, i),
                            z: self.z && self.z(d, i),

                            item: self.item && self.item(d, i),
                            group: self.group && self.group(d, i)

                        }

                    }).filter(function (d) {

                        return !isNaN(d.x) && !isNaN(d.y);

                    }), self.key ? function (d, i) { return self.key.call(this, d.data, i)} : null);


                bubbles.enter()

                    .insert("g")
                    .attr("class", "bubble")

                    .call(function () {
                        this.append("circle");
                        this.append("text");
                    });

                bubbles.exit()

                    .remove();

                bubbles

                    .classed("negative", function (d) { return d.z < 0 })

                    .attr("transform", function (d) { return "translate("+xScale(d.x)+","+yScale(d.y)+")"; })

                    .call(function () {

                        this.select("circle")

                            .attr("r", function (d) { return zScale(Math.abs(d.z) || 0) }) // !! handle z < 0
                            .attr("stroke", function (d) { return colorScale(d.group) })
                            .attr("fill", function (d) { return colorScale(d.group) });

                        this.select("text")

                            .text(function (d) { return d.item })

                            .style("visibility", function (d) { // !!! review/refactor
                                return 1.1*this.getBBox().width <= this.previousSibling.getBBox().width
                                    ? "visible" : "hidden"
                            })

                            .attr("dy", "0.75ex")
                            .attr("text-anchor", "middle")
                    })

                    .on("mouseenter", function () { return detail.call(this, true, d3.select(this).datum()) })
                    .on("mouseleave", function () { return detail.call(this, false, d3.select(this).datum()) })

                    .on("click", function (d, i) {
                        return detail.call(this, false, d3.select(this).datum()) && action.call(this, d, i); // hide details on action
                    });


                ////////////////////////////////////////////////////////////////////////////////////////////////////

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

                            anchor: function (d) { return {x: 0, y: -zScale(Math.abs(d.z) || 0)} }, // !! handle z < 0
                            align: "top"

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
