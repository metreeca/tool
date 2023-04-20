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

var core=require("metreeca-core");

var d3=require("d3");

module.exports=function tool(defaults, update, render) {

    update=update || function () {}; // called to update the setup as tool.update(setup, tool)
    render=render || function () {}; // called to handle a D3 selection as tool.render(nodes, tool)

    var setup={}; // the user provided setup
    var queue=[]; // pending scheduler timeouts


    function merge(target /*, source... */) { // merge sources into target

        for (var i=1; i < arguments.length; ++i) {

            var source=arguments[i];

            if (core.isObject(source)) {

                target=core.isObject(target) ? target : {};

                for (var p in source) {
                    if (source.hasOwnProperty(p)) { target[p]=merge(target[p], source[p]) }
                }

            } else {
                target=source; // don't clone arrays as they may be extended (eg by jquery/zepto)
            }
        }

        return target;
    }


    return (function self(target) {

        if (target === undefined) { // get the setup

            return merge({}, setup);

        } else if (target === null) { // reset to defaults

            return update.call(self, merge({}, defaults || {}, (setup={})), self) || self;

        } else if (core.isObject(target) || target === self) { // merge setup

            return update.call(self, merge({}, defaults || {}, merge(setup, target)), self) || self;

        } else if (target instanceof d3.selection) { // render in D3 selection

            return render.call(self, target, self) || self;

        } else if (core.isNode(target)) { // render in node

            return render.call(self, d3.select(target), self) || self;

        } else if (core.isNodeList(target)) { // render in nodeList

            return render.call(self, d3.selectAll(target), self) || self;

        } else if (core.isFunction(target)) { // execute function as tool.target()

            return target.call(self, self) || self;

        } else if (core.isNumber(target)) { // schedule calls
            if (target > 0) { // return a new scheduler

                function scheduler() { // (target...)

                    if (arguments.length) { // record targets

                        for (var i=0; i < arguments.length; ++i) {
                            scheduler.targets.push(arguments[i]);
                        }

                    } else { // no arguments > process targets

                        queue.splice(queue.indexOf(scheduler.timeout, 1)); // no longer pending > remove
                        scheduler.targets.forEach(self); // process targets

                    }

                    return scheduler;
                }

                scheduler.targets=[];
                scheduler.timeout=setTimeout(scheduler, target);

                queue.push(scheduler.timeout);

                return scheduler;

            } else { // clear pending schedulers

                while (queue.length) { clearTimeout(queue.shift()); }

                return self;
            }

        } else {

            return self;

        }

    })({});

};
