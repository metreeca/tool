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

"use strict";
/*
 * Copyright © 2020-2022 Metreeca srl
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
exports.__esModule=true;
exports.reorder=exports.insert= void 0;

function insert(array, target, value) {
    return array.reduce(function (a, v, i) {
        if (i === target) {
            a.push(value);
        }
        a.push(v);
        return a;
    }, []);
}

exports.insert=insert;

function reorder(array, target, source) {
    return target === source ? array : array.reduce(function (a, v, i) {
        if (i === target) {
            a.push(array[source]);
        }
        if (i !== source) {
            a.push(v);
        }
        return a;
    }, []);
}

exports.reorder=reorder;
