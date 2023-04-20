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

import { Immutable } from "@metreeca/link";


export function insert<T>(array: Immutable<T[]>, target: number, value: Immutable<T>) {
	return array.reduce((a, v, i) => {

		if ( i === target ) { a.push(value); }

		a.push(v);

		return a;

	}, [] as Immutable<T>[]);
}

export function reorder<T>(array: Immutable<T[]>, target: number, source: number) {
	return target === source ? array : array.reduce((a, v, i) => {

		if ( i === target ) { a.push(array[source]); }
		if ( i !== source ) { a.push(v); }

		return a;

	}, [] as Immutable<T>[]);
}