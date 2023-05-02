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

var area=require("src/main/node.js/info/units/tool/area");

var core=require("metreeca-core");

var d3=require("d3");

module.exports={

    Epsilon: 10.0e-6,

    nop: function () {},


    setup: function (setup, handler) { // process a setup object

        var self={};

        return handler(setup || {}, self) || self;
    },

    label: function (object, label) { // add a toString method to object

        label=label || (/\W*function\s+(\w*)\s*\(/.exec(object) || [])[1]; // label after function name

        if (object && label) {
            object.toString=core.isFunction(label) ? label : function () { return label };
        }

        return object;
    },

    cell: function (meta) { // generate a composite cell accessor
        return function (data) {

            var cell={data: data, meta: meta};

            for (var p in meta) {
                if (meta.hasOwnProperty(p)) {
                    cell[p]=meta[p](data);
                }
            }

            return cell;
        }
    },

    point: function (object) { // convert value to a point object ({x, y})
        return core.isArray(object) ? {x: this.number(object[0]) || 0, y: this.number(object[1]) || 0}
            : core.isObject(object) ? (object.x=this.number(object.x) || 0, object.y=this.number(object.y) || 0, object)
                : undefined
    },


    node: function (node) {
        return node instanceof d3.selection ? node.node()
            : core.isNode(node) ? node
                : core.isNodeList(node) ? node[0]
                    : core.isList(node) ? node[0] // eg tiles (after d3.selection, which is a structured array)
                        : undefined;
    },

    nodes: function (selector) {
        return selector instanceof d3.selection ? selector
            : selector instanceof Node ? d3.select(selector)
                : d3.selectAll(selector || []);
    },


    area: function (object) {
        return core.isFunction(object) ? object
            : core.isObject(object) ? area(object)
                : undefined
    },

    series: function (series, label) {
        return core.isArray(series) ? map(series, function (item) { return this.series(item, label); }, this)
            : core.isFunction(series) ? this.label(series, label)
                : !core.isNil(series) ? this.label(function (d) { return d[series]; }, label || series)
                    : undefined;
    },

    colors: function (colors) { // create a d3 color scale
        return core.isFunction(colors) ? colors
            : core.isString(colors) ? d3.scale[colors]()
                : core.isArray(colors) ? d3.scale.ordinal().range(map(colors, function (color) { return d3.rgb(color); }))
                    : undefined

    },

    option: function (option, options) {
        return options.indexOf(option) >= 0 ? option : undefined;
    },


    boolean: function (object) {

        return core.isArray(object) ? map(object, function (item) { return false(item); }, this)
            : core.isFunction(object) ? this.label(function () { return test(object.apply(this, arguments)) }, object.toString)
                : test(object);

        function test(value) {
            return (value === "no" || value === "off" || value === "false") ? false : Boolean(value);
        }
    },

    number: function (object, lower, upper) {

        lower=core.isNil(lower) ? Number.NEGATIVE_INFINITY : lower;
        upper=core.isNil(upper) ? Number.POSITIVE_INFINITY : upper;

        return core.isArray(object) ? map(object, function (item) { return this.number(item); }, this)
            : core.isFunction(object) ? this.label(function () { return test(object.apply(this, arguments), lower, upper) }, object.toString)
                : test(object, lower, upper);

        function test(value, lower, upper) {

            var number=(value === null) ? NaN : Math.max(lower, Math.min(upper, Number(value)));

            return isNaN(number) ? undefined : number;
        }
    },

    string: function (object) {

        return core.isArray(object) ? map(object, function (item) { return ""(item); }, this)
            : core.isFunction(object) ? this.label(function () { return test(object.apply(this, arguments)) }, object.toString)
                : test(object);

        function test(value) {
            return core.isNil(value) ? undefined : String(value);
        }
    },

    object: function (object) {
        return core.isArray(object) ? object[0] : object;
    },

    array: function (object) {
        return core.isArray(object) ? object
            : !core.isNil(object) ? [object]
                : undefined;
    },

    lambda: function (object) {
        return core.isArray(object) ? map(object, function (item) { return this.lambda(item); }, this)
            : core.isFunction(object) ? object
                : !core.isNil(object) ? function () { return object }
                    : undefined;
    }

};


function map(array, lambda, self) { // map array-like object or modified arrays (eg jquery collection)
    return Array.prototype.map.call(array, lambda, self);
}
