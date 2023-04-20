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

require("src/main/node.js/info/units/map/marker/marker.css");
require("leaflet/dist/leaflet.css");

var icon=require("raw!src/main/node.js/info/units/map/marker/marker.svg");

var area=require("src/main/node.js/info/units/tool/area");
var overlay=require("src/main/node.js/info/units/tool/overlay");
var tooltip=require("src/main/node.js/info/units/tool/tooltip");

var base=require("src/main/node.js/info/units/base");
var tool=require("src/main/node.js/info/units/base/tool");

var d3=require("d3");
var L=require("leaflet");


module.exports=function marker(defaults) {
    return tool(defaults,

        function update(setup, self) {

            self.locked=base.boolean(setup.locked); // interactive control locking

            // !!! key series?

            self.item=base.object(base.string(base.series(setup.item))); // item series
            self.group=base.object(base.string(base.series(setup.group))); // group series

            self.lat=base.object(base.number(base.series(setup.lat))); // latitude series
            self.lng=base.object(base.number(base.series(setup.lng))); // longitude series
            self.value=base.object(base.number(base.series(setup.value))); // value series

            self.port=base.object(setup.port) || "auto"; // the viewport ["auto" | {w, e, s, n} | {lat, lng, zoom?}]

            self.area=base.area(setup.area) || area(); // plot area
            self.colors=base.colors(setup.colors) || d3.scale.category10();

            self.marker=base.setup(setup.marker, function (setup, marker) {

                marker.size=base.number(base.object(setup.size), 8, 64) || 24; // marker size [px]

                marker.x=base.number(base.object(setup.x)) || marker.size/2; // marker horizontal anchor [px]
                marker.y=base.number(base.object(setup.y)) || marker.size; // marker horizontal anchor [px]

                marker.min=base.number(base.object(setup.min), 0) || marker.size/2; // minimum marker radius [f/px] { >= 0, [0..1] >> % of marker size }
                marker.max=base.number(base.object(setup.max), 0) || marker.size*2; // maximum marker radius [f/px] { >= 0, [0..1] >> % of marker size }

                marker.scale=d3.scale.linear();

            });

            self.label=base.string(setup.label); // chart label // !!! support node with positioning css properties

            self.transition=base.setup(setup.transition, function (setup, transition) {

                transition.duration=base.number(setup.duration, 0) || 250; // transition duration [ms] // !!! factor default

            });

            // map controls generator node.controls(cell):node~ (the result is positioned according to css top/bottom/left/right)

            self.controls=base.lambda(base.object(setup.controls));

            // tooltip generator node.detail(cell):node~

            self.detail=base.lambda(base.object(setup.detail));

            self.action=base.lambda(base.object(setup.action)); // action handler node.action(cell):boolean
            self.move=base.lambda(base.object(setup.move)); // move event handler node.move({user:boolean, n, e, s, w, lat, lng, zoom}):boolean

            self.tooltip=tooltip(); // the tooltip manager

        },

        function render(nodes, self) {
            nodes.each(function (data) {

                data=(data || []).map(function (d, i) {
                    return {

                        i: i,
                        j: 0,

                        data: d,
                        meta: {

                            item: self.item,
                            group: self.group,

                            lat: self.lat,
                            lng: self.lng,
                            value: self.value

                        },

                        item: self.item && self.item(d, i),
                        group: self.group && self.group(d, i),

                        lat: self.lat && self.lat(d, i),
                        lng: self.lng && self.lng(d, i),
                        value: self.value && self.value(d, i)
                    }
                });

                var area=self.area(this);

                var lat=d3.extent(data, function (d) { return d.lat });
                var lng=d3.extent(data, function (d) { return d.lng });

                var vext=d3.extent(data, function (d, i) { return d.value });
                var vmin=vext[0] || 0;
                var vmax=vext[1] || 0;

                var rmin=(self.marker.min > 1 ? self.marker.min : self.marker.min*self.marker.size);
                var rmax=(self.marker.max > 1 ? self.marker.max : self.marker.max*self.marker.size);

                var vScale=self.marker.scale
                    .domain([0, Math.max(Math.abs(vmin), Math.abs(vmax))])
                    .range([rmin, rmax]);

                var colorScale=self.colors
                    .domain(self.group || []);

                //// root container ////////////////////////////////////////////////////////////////////////////////

                var root=d3.select(this)

                    .classed({info: true, map: true, marker: true});

                root.selectAll(function () { return this.childNodes; }) // remove leftovers

                    .filter(function () { return !d3.select(this).classed("leaflet-container") })

                    .remove();

                root.call(overlay, self.controls);


                //// map container /////////////////////////////////////////////////////////////////////////////////

                var container=root.selectAll(".leaflet-container")

                    .classed("locked", self.locked)

                    .data([data]);

                container.enter()

                    .append("div");

                container.exit()

                    .remove();

                container

                    .style({
                        left: area.left+"px",
                        top: area.top+"px",
                        width: area.width+"px",
                        height: area.height+"px"
                    })

                    .each(function (d) { // initialize after area is set

                        var map=this.$map || (this.$map=L.map(this)

                            // see https://carto.com/location-data-services/basemaps/

                            .addLayer(L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/{style}/{z}/{x}/{y}.png", {
                                maxZoom: 18,
                                style: "light_all", // or "rastertiles/voyager"
                                attribution: "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attribution'>CARTO</a>"
                            }))

                            .on("moveend", function (e) {
                                e.target.fire("map:move", {user: true}); // namespaced event
                            }))

                            .on("dragstart", function () {
                                self.tooltip({

                                    disabled: true,
                                    layer: root

                                })(root);
                            })

                            .on("dragend", function () {
                                self.tooltip({disabled: false});
                            });

                        [ // configure interactive handlers (http://leafletjs.com/reference.html#map-properties)

                            map.dragging,
                            map.touchZoom,
                            map.doubleClickZoom,
                            map.scrollWheelZoom,
                            map.boxZoom,
                            map.keyboard,
                            map.tap

                        ].forEach(function (handler) {
                            if (handler) { // ;( map.tap may be null…
                                if (self.locked) { handler.disable(); } else { handler.enable(); }
                            }
                        });

                        var zoomControl=map.zoomControl;

                        if (self.locked && zoomControl._map) {
                            zoomControl.removeFrom(map);
                        } else if (!self.locked && !zoomControl._map) {
                            zoomControl.addTo(map);
                        }


                        // adapt viewport

                        map.off("map:move"); // disable move events before fitting bounds

                        var level=0.25; // default zoom level [fraction]
                        var padding=(1.25*rmax);

                        var opts={
                            animate: false,
                            padding: [padding, padding]
                        };

                        if (["north", "south", "west", "east"] // user supplied port
                            .every(function (x) { return self.port[x] !== undefined })) {

                            map.fitBounds([
                                [self.port.south, self.port.west],
                                [self.port.north, self.port.east]
                            ], opts);

                        } else if (["lat", "lng"] // user supplied center
                            .every(function (x) { return self.port[x] !== undefined })) {

                            map.setView(
                                L.latLng(self.port.lat, self.port.lng),
                                self.port.zoom !== undefined ? self.port.zoom : map.getZoom(),
                                opts);

                        } else if (self.port === "auto") { // best-fit port

                            if (data.length > 1 // port computed from coordinates range
                                && lat[0] !== undefined && lng[0] !== undefined) {

                                map.fitBounds([
                                    [lat[1], lng[1]],
                                    [lat[0], lng[0]]
                                ], opts);

                            } else if (data.length == 1 // port centered on singleton point at default zoom
                                && lat[0] !== undefined && lng[0] !== undefined) {

                                map.setView(
                                    [lat[0], lng[0]],
                                    Math.round(level*map.getMaxZoom()+(1-level)*map.getMinZoom()),
                                    opts);

                            } else {
                                map.fitWorld(opts);
                            }

                        }

                        map.invalidateSize(false) // adapt to container
                            .on("map:move", move) // rebind move handler
                            .fire("map:move", {user: false}); // report computed bounds

                        // add markers

                        var markers=(this.$markers || (this.$markers=L.featureGroup()).addTo(map))

                            .clearLayers();

                        d.forEach(function (d) {

                            if (!isNaN(d.lat) && !isNaN(d.lng)) {
                                markers.addLayer(marker(d));
                            }

                        });


                        function marker(d) {
                            return self.value ? bubble(d) : pin(d);
                        }

                        function bubble(d) {

                            var radius=vScale(Math.abs(d.value) || 0);

                            return L.circleMarker([d.lat, d.lng])

                                .setRadius(radius)

                                .setStyle({
                                    color: colorScale(d.group),
                                    fill: (d.value || 0) >= 0,
                                    stroke: true,
                                    weight: 1
                                })

                                .on("mouseover", function (e) {
                                    detail.call(d3.select(e.originalEvent.currentTarget).datum(d).node(), true,
                                        map.latLngToContainerPoint([d.lat, d.lng])
                                            .add([area.left, area.top-radius]));
                                })

                                .on("mouseout", function (e) {
                                    detail.call(d3.select(e.originalEvent.currentTarget).datum(d).node(), false)
                                })

                                .on("click", function (e) {
                                    return detail.call(d3.select(e.originalEvent.currentTarget).datum(d).node(), false)
                                        && action.call(d3.select(e.originalEvent.currentTarget).datum(d).node(), d, 0); // hide details on action
                                });
                        }

                        function pin(d) {
                            return L.marker([d.lat, d.lng], {riseOnHover: true})

                                .setIcon(L.divIcon({
                                    className: "pin",
                                    iconSize: [self.marker.size, self.marker.size],
                                    iconAnchor: [self.marker.x, self.marker.y],
                                    html: icon.replace("<svg", "<svg style='fill: "+colorScale(d.group)+"'") // !!! review
                                }))

                                .on("mouseover", function (e) {
                                    if (!target(e).contains(related(e))) { // ;( ignore bubbling events
                                        detail.call(d3.select(target(e)).datum(d).node(), true, map
                                            .latLngToContainerPoint([d.lat, d.lng])
                                            .add([area.left, area.top-self.marker.size]));
                                    }
                                })

                                .on("mouseout", function (e) {
                                    if (!target(e).contains(related(e))) { // ;( ignore bubbling events
                                        detail.call(d3.select(target(e)).datum(d).node(), false)
                                    }
                                })

                                .on("click", function (e) {
                                    return action.call(d3.select(target(e)).datum(d).node(), d, 0);
                                });
                        }

                        // ;(D marker events are delegated: e.originalEvent.currentEvent reports the container

                        function target(e) { return e.target._icon; }

                        function related(e) { return e.originalEvent.relatedTarget; }

                    });


                function detail(visible, anchor) {

                    if (self.detail) {
                        self.tooltip({

                            visible: visible,
                            layer: root,

                            content: self.detail,

                            align: "top",
                            anchor: anchor,
                            absolute: true

                        })(this);
                    }

                    return true;
                }

                function action(d, i) {
                    return self.action ? self.action.call(this, d, i) : true;
                }

                function move(e) {

                    var bounds=e.target.getBounds();
                    var center=e.target.getCenter();
                    var zoom=e.target.getZoom();

                    return self.move ? self.move.call(this, {

                        user: e.user, // true if the viewport change was triggered by a user action

                        west: bounds.getWest(),
                        east: bounds.getEast(),
                        north: bounds.getNorth(),
                        south: bounds.getSouth(),

                        lat: center.lat,
                        lng: center.lng,
                        zoom: zoom

                    }) : true;
                }

            });
        });
};
