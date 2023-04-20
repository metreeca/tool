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

module.exports={

    isNil: isNil,
    isBoolean: isBoolean,
    isNumber: isNumber,
    isString: isString,
    isFunction: isFunction,
    isObject: isObject,
    isArray: isArray,
    isList: isList,

    isNode: isNode,
    isNodeList: isNodeList,
    isEvent: isEvent

};

//// Type Tests ////////////////////////////////////////////////////////////////////////////////////////////////////////

function isNil(object) {
    return object === null || typeof object === "undefined";
}

function isBoolean(object) {
    return typeof object === "boolean"
        || object instanceof Boolean
        || Object.prototype.toString.call(object) === "[object Boolean]";
}

function isNumber(object) {
    return typeof object === "number"
        || object instanceof Number
        || Object.prototype.toString.call(object) === "[object Number]";
}

function isString(object) {
    return typeof object === "string"
        || object instanceof String
        || Object.prototype.toString.call(object) === "[object String]";
}

function isFunction(object) {
    return object instanceof Function
        || Object.prototype.toString.call(object) === "[object Function]";
}

function isObject(object) {
    return Object.prototype.toString.call(object) === "[object Object]";
}

function isArray(object) {
    return Array.isArray(object);
}

function isList(object) { // true if object is an array-like object
    return !isNil(object) && !isString(object) && !isFunction(object) && object.length >= 0;
}


//// DOM Type Tests ////////////////////////////////////////////////////////////////////////////////////////////////////

function isNode(object) {
    return object instanceof Node
        || !!object && typeof object.nodeType === "number";
}

function isNodeList(object) {
    return object instanceof NodeList
        || object instanceof HTMLCollection
        || Object.prototype.toString.call(object) === "[object NodeList]"
        || Object.prototype.toString.call(object) === "[object HTMLCollection]";
}

function isEvent(object) {
    return object instanceof Event
        || /\[object \w+Event\]/.test(Object.prototype.toString.call(object));
}
