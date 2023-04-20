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

require("src/main/node.js/info/units/info.css");

module.exports={

    chart: {

        pie: require("src/main/node.js/info/units/chart/pie/pie"),
        bar: require("src/main/node.js/info/units/chart/bar/bar"),
        line: require("src/main/node.js/info/units/chart/line/line"),
        bubble: require("src/main/node.js/info/units/chart/bubble/bubble")

    },

    map: {

        marker: require("src/main/node.js/info/units/map/marker/marker")

    },

    d3: require("d3"),
    L: require("leaflet")

};


function inject() { // !!! refactor
    document.body.appendChild(document.adoptNode(new DOMParser()
        .parseFromString(require("raw!src/main/node.js/info/units/base/defs.svg"), "text/xml").documentElement));
}

if (document.readyState !== "loading") {
    inject();
} else {
    document.addEventListener("DOMContentLoaded", inject);
}
