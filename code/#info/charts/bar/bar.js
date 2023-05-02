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

require("src/main/node.js/info/units/chart/bar/bar.css");

var area=require("src/main/node.js/info/units/tool/area");
var overlay=require("src/main/node.js/info/units/tool/overlay");
var tooltip=require("src/main/node.js/info/units/tool/tooltip");

var base=require("src/main/node.js/info/units/base");
var chart=require("src/main/node.js/info/units/base/chart");

var d3=require("d3");

module.exports=function bar(setup) {
    return chart(
        setup,

        function update(setup, self) {

            self.key=base.object(base.series(setup.key)); // key series
            self.item=base.object(base.series(setup.item)); // item series
            self.value=base.array(base.number(base.series(setup.value))) || []; // value series

            self.orient=base.option(setup.orient, ["vertical", "horizontal"]) || "vertical";
            self.layout=base.option(setup.layout, ["grouped", "stacked"]) || "grouped";
            self.area=base.area(setup.area) || area(); // plot area
            self.colors=base.colors(setup.colors) || d3.scale.category20c();

            self.main=base.setup(setup.main, function (setup, main) { // main axis

                main.label=base.string(base.object(setup.label)) || "";
                main.offset=base.number(base.object(setup.offset)) || 0; // axis offset from the charting area [px]
                main.grid=base.boolean(base.object(setup.grid)); // display horizontal grid lines?
                main.hair=base.boolean(base.object(setup.hair)); // display horizontal hair lines?

                main.scale=d3.scale.linear().nice();
                main.axis=d3.svg.axis().scale(main.scale);

            });

            self.cross=base.setup(setup.cross, function (setup, cross) { // cross axis

                cross.label=base.string(base.object(setup.label)) || "";
                cross.offset=base.number(base.object(setup.offset)) || 0; // axis offset from the charting area [px]

                cross.scale=d3.scale.ordinal();
                cross.axis=d3.svg.axis().scale(cross.scale);

            });

            self.group=base.setup(setup.group, function (setup, group) {

                group.spacing=base.number(setup.spacing, 0, 1) || 0.1; // cross-axis size fraction allocated to space bar groups
                group.padding=base.number(setup.padding, 0, 1) || 0.1; // bar group size fraction allocate to space bars

                group.scale=d3.scale.ordinal();
            });


            self.transition=base.setup(setup.transition, function (setup, transition) {

                transition.duration=base.number(setup.duration, 0) || 250; // transition duration [ms] // !!! factor default

            });

            // chart controls generator node.controls(d, i):node~ (the result is positioned according to css top/bottom/left/right)

            self.controls=base.lambda(base.object(setup.controls));

            // tooltip generator node.detail(cell={i, j, data, meta, item', value', positive, negative}):node~

            self.detail=base.lambda(base.object(setup.detail));

            // action handler node.action(d={i, j, data, meta, item', value', positive, negative}):boolean

            self.action=base.lambda(base.object(setup.action));

            self.tooltip=tooltip(); // the tooltip manager
        },

        function render(nodes, self) {
            nodes.each(function (data) {

                data=data || [];

                var min=d3.min(data, {

                    grouped: function (datum, index) {
                        return d3.min(self.value.map(function (value) { return value(datum, index); })) || 0;
                    },

                    stacked: function (datum, index) { // !!! review
                        return self.value.reduce(function (sum, value) { return sum+(value(datum, index) || 0); }, 0);
                    }

                }[self.layout]);

                var max=d3.max(data, {

                    grouped: function (datum, index) {
                        return d3.max(self.value.map(function (value) { return value(datum, index); })) || 0;
                    },

                    stacked: function (datum, index) { // !!! review
                        return self.value.reduce(function (sum, value) { return sum+(value(datum, index) || 0); }, 0);
                    }

                }[self.layout]);

                var area=self.area(this);
                var width=area.width;
                var height=area.height;

                // !!! altering setup object will break callbacks when drawing multiple charts

                var crossScale=self.cross.scale
                    .domain(data.map(function (row, n) { return n; }))
                    .rangeRoundBands([
                        0, {vertical: width, horizontal: height}[self.orient]
                    ], self.group.spacing);

                var mainScale=self.main.scale
                    .domain([Math.min(0, min), Math.max(0, max)])
                    .range({vertical: [height, 0], horizontal: [0, width]}[self.orient]);

                var mainAxis=self.main.axis
                    .orient({vertical: "left", horizontal: "bottom"}[self.orient]);

                var crossAxis=self.cross.axis
                    .orient({vertical: "bottom", horizontal: "left"}[self.orient])
                    .tickFormat(function (key, index) {
                        return self.item ? self.item(data[index]) : null;
                    });

                var colorScale=self.colors
                    .domain(self.value);

                var groupScale=self.group.scale
                    .domain(self.value)
                    .rangeRoundBands([0, crossScale.rangeBand()], self.group.padding);


                //// root container ////////////////////////////////////////////////////////////////////////////////

                var root=d3.select(this)

                    .classed({info: true, chart: true, bar: true});

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

                    .classed("vertical", self.orient === "vertical")
                    .classed("horizontal", self.orient === "horizontal")
                    .classed("stacked", self.layout === "stacked")
                    .classed("grouped", self.layout === "grouped")
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

                            .attr("class", "main hair")
                            .style("opacity", 0);

                    });

                plot

                    .attr("transform", "translate("+area.left+","+area.top+")");


                //// main axis /////////////////////////////////////////////////////////////////////////////////////

                var main=plot.selectAll(".main.axis")

                    .data([data]);

                main.enter()

                    .append("g")
                    .attr("class", "main axis")

                    .call(function () {
                        this.append("text")
                            .attr("class", "label")
                            .attr("dy", ".71em");
                    });

                main

                    //.transition()
                    //.duration(self.transition.duration)

                    .attr("transform", {
                        vertical: "translate(-"+self.main.offset+", 0)",
                        horizontal: "translate(0,"+(height+self.main.offset)+")"
                    }[self.orient])

                    .call(mainAxis)

                    .call(function () {
                        this.select(".label")

                            .attr("x", {vertical: 0, horizontal: width}[self.orient])
                            .attr("y", {vertical: 6, horizontal: 25}[self.orient])
                            .attr("transform", {vertical: "rotate(-90)", horizontal: ""}[self.orient])

                            .style("text-anchor", "end")
                            .text(self.main.label)
                    });


                //// main grid ///////////////////////////////////////////////////////////////////////////////

                var grid=plot.selectAll(".major.main.grid")

                    .data(self.main.grid ? mainScale.ticks() : []);

                grid.enter()

                    .insert("line", ":first-child") // under other existing elements
                    .attr("class", "major main grid");

                grid.exit()

                    .remove();

                grid

                    .attr({

                        vertical: {
                            x1: 0,
                            x2: width,
                            y1: function (d) { return mainScale(d) },
                            y2: function (d) { return mainScale(d) }
                        },

                        horizontal: {
                            x1: function (d) { return mainScale(d) },
                            x2: function (d) { return mainScale(d) },
                            y1: 0,
                            y2: height
                        },

                    }[self.orient]);


                //// cross axis ////////////////////////////////////////////////////////////////////////////////////

                var cross=plot.selectAll(".cross.axis")

                    .data([data]);

                cross.enter()

                    .append("g")
                    .attr("class", "cross axis")

                    .call(function () {
                        this.append("text")
                            .attr("class", "label")
                            .attr("dy", ".71em")
                    });

                cross

                    //.transition()
                    //.duration(self.transition.duration)

                    .attr("transform", {
                        vertical: "translate(0,"+(height+self.cross.offset)+")",
                        horizontal: "translate(-"+self.cross.offset+", 0)"
                    }[self.orient])

                    .call(crossAxis)

                    .call(function () { // tweak tick labels

                        var labels=this.selectAll(".tick text");

                        var fit=labels.filter(function () {
                            return this.getComputedTextLength() > crossScale.rangeBand();
                        }).empty();

                        var slant=self.orient === "vertical" && !fit ? 35 : 0; // slanting
                        var sin=Math.sin(Math.PI*slant/180);

                        labels.text(function () { // sizing ;(compute height before applying slant)

                            var k=0.66;

                            var b={

                                vertical: sin,
                                horizontal: 1

                            }[self.orient];

                            return k*this.getBBox().height < b*crossScale.rangeBand()
                                ? d3.select(this).text() : null
                        });

                        if (slant) {

                            labels

                                .style("text-anchor", "end")
                                .attr("dx", "-0.8em")
                                .attr("dy", "0.15em")
                                .attr("transform", function () { return "rotate(-"+slant+")" })

                        } else {

                            labels.attr("transform", null)

                        }

                        labels.text(function () { // trimming

                            var text=d3.select(this).text();

                            var box=this.getBBox();
                            var anchor=this.ownerSVGElement.createSVGPoint();

                            anchor.x=box.x+box.width;
                            anchor.y=box.y;

                            anchor=anchor.matrixTransform(this.getCTM()); // transform to chart coordinates

                            var d={

                                vertical: 0.8*(area.portHeight-anchor.y),
                                horizontal: 0.9*anchor.x

                            }[self.orient];

                            var k={

                                vertical: sin,
                                horizontal: 1

                            }[self.orient];

                            if (k*this.getComputedTextLength() < d) {
                                return text;
                            }

                            for (var n=text.length; n >= 5; --n) {
                                if (k*(n+2)/n*this.getSubStringLength(0, n) < d) { // +2 >> allot for …
                                    return text.substr(0, n)+"…";
                                }
                            }

                            return "";
                        })

                    })

                    .call(function () {
                        this.select(".label")

                            .attr("x", width-crossScale.rangeBand()/2)
                            .attr("y", {vertical: 25, horizontal: -12}[self.orient])
                            .style("text-anchor", "end")
                            .text(self.cross.label);
                    });


                //// bar groups ////////////////////////////////////////////////////////////////////////////////////

                var groups=plot.selectAll(".group")

                    .data(data, self.key);

                groups.enter()

                    .insert("g")
                    .attr("class", "group");

                groups

                    .attr("transform", {

                        vertical: function (d, i) { return "translate("+crossScale(i)+", 0)"; },

                        horizontal: function (d, i) { return "translate(0, "+crossScale(i)+")"; }

                    }[self.orient]);

                groups.exit()

                    //.transition()
                    //.duration(self.transition.duration)
                    //
                    //.attr("transform", "translate(0, 0)")

                    .remove();


                //// bars //////////////////////////////////////////////////////////////////////////////////////////

                var bars=groups.selectAll(".bar")

                    .data(function (d, i) {

                        // keep geometric cell ordering consistent with series reading ordering

                        return self.orient === "vertical" && self.layout === "stacked"

                            ? self.value.reduceRight(scan, [])
                            : self.value.reduce(scan, []);

                        function scan(cells, value, n) {

                            var k=cells.length;

                            cells.push({

                                i: i,
                                j: n,

                                data: d,

                                meta: {
                                    item: self.item,
                                    value: value
                                },

                                item: self.item && self.item(d, i),
                                value: value(d, i),

                                positive: k && cells[k-1].positive+Math.max(0, cells[k-1].value) || 0, // positive baseline
                                negative: k && cells[k-1].negative+Math.min(0, cells[k-1].value) || 0 // negative baseline

                            });

                            return cells;

                        }


                    }, function (d) {

                        return d.meta.value;

                    });


                bars.enter()

                    .append("rect")
                    .attr("class", "bar");

                bars.style("fill", function (d) { return colorScale(d.meta.value); })

                    .call({ // !!! refactor

                        grouped: {

                            vertical: function () {
                                this

                                    //.transition()
                                    //.duration(self.transition.duration)

                                    .attr("x", function (d) { return groupScale(d.meta.value); })
                                    .attr("width", groupScale.rangeBand())

                                    //.transition()
                                    //.duration(self.transition.duration)

                                    .attr("y", function (d) {
                                        return d.value >= 0
                                            ? mainScale(d.value)
                                            : mainScale(0);
                                    })

                                    .attr("height", function (d) {
                                        return d.value >= 0
                                            ? mainScale(0)-mainScale(d.value)
                                            : mainScale(d.value)-mainScale(0);
                                    });
                            },

                            horizontal: function () { // !!! transitions
                                this

                                    //.transition()
                                    //.duration(self.transition.duration)

                                    .attr("y", function (d) { return groupScale(d.meta.value); })
                                    .attr("height", groupScale.rangeBand())

                                    //.transition()
                                    //.duration(self.transition.duration)

                                    .attr("x", function (d) {
                                        return d.value >= 0
                                            ? mainScale(0)
                                            : mainScale(d.value)
                                    })

                                    .attr("width", function (d) {
                                        return d.value >= 0
                                            ? mainScale(d.value)-mainScale(0)
                                            : mainScale(0)-mainScale(d.value)
                                    });
                            }

                        },

                        stacked: {

                            vertical: function () {
                                this

                                    //.transition()
                                    //.duration(self.transition.duration)

                                    .attr("y", function (d) {
                                        return d.value >= 0
                                            ? mainScale(d.value+d.positive)
                                            : mainScale(d.negative);
                                    })

                                    .attr("height", function (d) {
                                        return d.value >= 0
                                            ? mainScale(d.positive)-mainScale(d.value+d.positive)
                                            : mainScale(d.value+d.negative)-mainScale(d.negative);
                                    })

                                    //.transition()
                                    //.duration(self.transition.duration)

                                    .attr("x", 0)
                                    .attr("width", crossScale.rangeBand());
                            },

                            horizontal: function () { // !!! transitions
                                this

                                    //.transition()
                                    //.duration(self.transition.duration)

                                    .attr("x", function (d) {
                                        return d.value >= 0
                                            ? mainScale(d.positive)
                                            : mainScale(d.value+d.negative)
                                    })

                                    .attr("width", function (d) {
                                        return d.value >= 0
                                            ? mainScale(d.value+d.positive)-mainScale(d.positive)
                                            : mainScale(d.negative)-mainScale(d.value+d.negative)
                                    })

                                    //.transition()
                                    //.duration(self.transition.duration)

                                    .attr("y", 0)
                                    .attr("height", crossScale.rangeBand());
                            }

                        }

                    }[self.layout][self.orient])

                    .on("mouseenter", function () { return detail.call(this, true, d3.select(this).datum()) })
                    .on("mouseleave", function () { return detail.call(this, false, d3.select(this).datum()) })

                    .on("click", function (d, i) {
                        return detail.call(this, false, d3.select(this).datum()) && action.call(this, d, i); // hide details on action
                    });


                bars.exit()

                    //.transition()
                    //.duration(self.transition.duration)
                    //
                    //.call({ // !!! refactor
                    //
                    //	vertical: function () {
                    //		this.attr("y", height).attr("height", 0);
                    //	},
                    //
                    //	horizontal: function () { // !!! transitions
                    //		this.attr("x", 0).attr("width", 0);
                    //	}
                    //
                    //}[self.orient])

                    .remove();

                ////////////////////////////////////////////////////////////////////////////////////////////////////

                function detail(visible, d) {

                    var groupedValue=mainScale(d.value);
                    var stackedValue=(d.value >= 0) ? mainScale(d.value+d.positive) : mainScale(d.negative);

                    chart.select(".main.hair")

                        .style("opacity", visible && self.main.hair ? 1 : 0)

                        .attr({

                            vertical: {

                                grouped: {
                                    x1: 0-self.main.offset,
                                    x2: width+self.main.offset,
                                    y1: groupedValue,
                                    y2: groupedValue
                                },

                                stacked: {
                                    x1: 0-self.main.offset,
                                    x2: width+self.main.offset,
                                    y1: stackedValue,
                                    y2: stackedValue
                                }
                            },

                            horizontal: {

                                grouped: {
                                    x1: groupedValue,
                                    x2: groupedValue,
                                    y1: 0-self.main.offset,
                                    y2: height+self.main.offset
                                },

                                stacked: {
                                    x1: stackedValue,
                                    x2: stackedValue,
                                    y1: 0-self.main.offset,
                                    y2: height+self.main.offset
                                }

                            }

                        }[self.orient][self.layout]);

                    if (self.detail) {
                        self.tooltip({

                            visible: visible,
                            layer: root,

                            content: self.detail,

                            anchor: {

                                vertical: {

                                    grouped: function (d) {
                                        return {
                                            x: groupScale(d.meta.value)+groupScale.rangeBand()/2,
                                            y: mainScale(d.value)
                                        }
                                    },

                                    stacked: function (d) {
                                        return {
                                            x: crossScale.rangeBand()/2,
                                            y: mainScale(d.value+d.positive)
                                        }
                                    }
                                },

                                horizontal: {

                                    grouped: function (d) {
                                        return {
                                            x: mainScale(d.value),
                                            y: groupScale(d.meta.value)+groupScale.rangeBand()/2
                                        }
                                    },

                                    stacked: function (d) {
                                        return {
                                            x: mainScale(d.value+d.positive),
                                            y: crossScale.rangeBand()/2
                                        }
                                    }
                                }

                            }[self.orient][self.layout],

                            align: {

                                vertical: "top",
                                horizontal: "right"

                            }[self.orient]

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
