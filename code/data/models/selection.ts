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

import { isArray } from "@metreeca/core";
import { equals, Value } from "@metreeca/core/value";
import { Collection } from "@metreeca/data/models/collection";
import { useState } from "react";


export type Selection<V extends Value>=Readonly<[

	ReadonlyArray<V>,

	(delta?: SelectionDelta<V>) => void

]>

export type SelectionDelta<V extends Value>=Readonly<{ value: V, selected: boolean }> | ReadonlyArray<V>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useSelection<V extends Value>(value?: Collection<V>): Selection<V> {

	const [selection, setSelection]=useState<ReadonlyArray<V>>([]);

	return [

		selection,

		delta => {

			if ( delta === undefined ) {

				setSelection([]);

			} else if ( isArray<V>(delta) ) {

				setSelection(delta);

			} else { // !!! type inference

				const value: V=(delta as any).value;
				const selected: boolean=(delta as any).selected;

				setSelection([

					...selection.filter(v => !equals(v, value)),
					...(selected ? [value] : [])

				]);

			}

		}
	];
}


