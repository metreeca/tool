/*
 * Copyright © 2020-2024 Metreeca srl
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
import { Entry } from "@metreeca/core/entry";
import { Frame, toModel, toQuery } from "@metreeca/core/frame";
import { Value } from "@metreeca/core/value";
import { Setter } from "@metreeca/data/hooks";
import { useQuery } from "@metreeca/data/models/query";
import { useResource } from "@metreeca/data/models/resource";


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

	V extends Entry,
	K extends string

>(entry: Entry & { [key in K]: undefined | V[] }, field: K & keyof typeof entry, {

	store

}: Partial<{

	store: [Frame, Setter<Frame>]

}>={}): Collection<V> {

	const model=entry?.[field]?.[0]; // the first item in the collection model array

	if ( model === undefined ) {
		throw new RangeError(`undefined model for collection <${field}>`);
	}

	const [query, setQuery]=store ?? useQuery();

	const cleanModel=immutable(toModel(model));
	const cleanQuery=immutable(toQuery(query));

	return [

		{

			filtered: !isEmpty(cleanQuery),

			model: cleanModel,
			query: cleanQuery,

			items<M extends Value>(model: M): undefined | ReadonlyArray<M> {

				const [resource]=useResource({ id: entry.id, [field]: [model] });

				return resource && (resource[field] || []) as ReadonlyArray<M>;

			}

		},

		delta => {

			if ( delta === undefined ) {

				setQuery({});

			} else {

				if ( delta.query !== undefined ) {
					setQuery(toQuery({ ...query, ...delta.query }));
				}

			}

		}

	];

}

