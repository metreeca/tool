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

import { immutable, isEmpty } from "@metreeca/core";
import { clean, Frame }       from "@metreeca/core/entry";
import { Value }              from "@metreeca/core/value";
import { Setter }             from "@metreeca/data/hooks";
import { useResource }        from "@metreeca/data/models/resource";
import { useState }           from "react";


export type Collection<V extends Value>=Readonly<[

	Readonly<{

		filtered: boolean

		model: V
		query: Readonly<Frame>

		items<M extends Value>(model: M): undefined | ReadonlyArray<M>

	}>,

	(delta?: Partial<Readonly<{

		query: Frame

	}>>) => void

]>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useCollection<

	V extends Value,
	K extends string

>(resource: Frame & { [key in K]: undefined | V[] }, field: K & keyof typeof resource, {

	id="",

	store

}: Partial<{

	id: string

	store: [Frame, Setter<Frame>]

}>={}): Collection<V> {

	const model=immutable(resource?.[field]?.[0]); // the first item in the collection model array


	if ( model === undefined ) {
		throw new RangeError(`undefined model for collection <${field}>`);
	}


	const [query, setQuery]=store ?? useState(immutable({}));


	return [

		{

			filtered: !isEmpty(query),

			model,
			query,

			items<M extends Value>(model: M): undefined | ReadonlyArray<M> {

				const [resource]=useResource({ [field]: [model] }, { id });

				return resource?.[field] as undefined | ReadonlyArray<M>;

			}

		},

		delta => {

			if ( delta === undefined ) {

				setQuery({});

			} else {

				if ( delta.query !== undefined ) {
					setQuery(clean({ ...query, ...delta.query }));
				}

			}

		}

	];

}

