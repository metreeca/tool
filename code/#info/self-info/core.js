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

require("src/main/node.js/core/units/polyfills/custom-event.js");
require("src/main/node.js/core/units/polyfills/starts-with.js");
require("src/main/node.js/core/units/polyfills/ends-with.js");

var types=require("src/main/node.js/core/units/types");


module.exports={

    id: id,
    copy: copy,

    equals: equals,

    isNil: types.isNil,
    isBoolean: types.isBoolean,
    isNumber: types.isNumber,
    isString: types.isString,
    isFunction: types.isFunction,
    isObject: types.isObject,
    isArray: types.isArray,
    isList: types.isList,

    isNode: types.isNode,
    isNodeList: types.isNodeList,
    isEvent: types.isEvent,


    uuid: function uuid(a) { // http://stackoverflow.com/a/7061193/739773
        return a ? (a^Math.random()*16>>a/4).toString(16) : ([1e7]+ -1e3+ -4e3+ -8e3+ -1e11).replace(/[018]/g, uuid)
    },


    type: function (proto) {

        proto=proto || {};

        var constructor=types.isFunction(proto["new"]) ? proto["new"] : function () {};

        for (var p in proto) {
            if (proto.hasOwnProperty(p) && proto[p] !== constructor) {
                constructor.prototype[p]=proto[p];
            }
        }

        return constructor;
    }

};

var unique=0;


//// Utilities /////////////////////////////////////////////////////////////////////////////////////////////////////////

function id() { // generate a unique numeric id
    return ++unique;
}

function copy(target) { // [varargs] copy properties to target

    target=target || {};

    for (var i=1; i < arguments.length; ++i) {

        var source=arguments[i];

        for (var p in source) {
            if (source.hasOwnProperty(p)) { target[p]=source[p]; }
        }
    }

    return target;
}

function equals(x, y) { // deep equality test

    if (types.isList(x) && types.isList(y)) {

        if (x.length == y.length) {

            for (var n=0; n < x.length; ++n) {
                if (!equals(x[n], y[n])) { return false; }
            }

            return true;

        } else {
            return false;
        }

    } else if (types.isObject(x) && types.isObject(y)) {

        var kx=Object.keys(x);
        var ky=Object.keys(y);

        if (kx.length == ky.length) {

            for (var n=0; n < kx.length; ++n) {
                if (!equals(x[kx[n]], y[kx[n]])) { return false; }
            }

            return true;

        } else {
            return false;
        }

    } else if (types.isNil(x) && types.isNil(y)
        || types.isBoolean(x) && types.isBoolean(y)
        || types.isNumber(x) && types.isNumber(y)
        || types.isString(x) && types.isString(y)
        || types.isFunction(x) && types.isFunction(y)
        || types.isNode(x) && types.isNode(y)
        || types.isEvent(x) && types.isEvent(y)) {

        return x == y;

    } else {
        return false;
    }

}
