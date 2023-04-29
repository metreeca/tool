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

import { asArray, error, isArray, toType, Type } from "@metreeca/core";
import { isEntry } from "@metreeca/core/entry";
import { isNumber } from "@metreeca/core/number";
import { model as getModel, Value } from "@metreeca/core/value";
import { useCache } from "@metreeca/data/hooks/cache";
import { Collection } from "@metreeca/data/models/collection";
import { useState } from "react";


export interface Option<V> {

	readonly value: null | V;
	readonly count: number;

	readonly selected: boolean;

}

export type Options<V extends Value>=Readonly<[

	Readonly<{

		ready: boolean

		type: Type<V>

		keywords: string
		offset: number
		limit: number

		items: undefined | ReadonlyArray<Option<V>>

		more: boolean;

	}>,

	(delta?: Partial<Readonly<{

		keywords: string
		offset: number
		limit: number

		selection: Readonly<{ value: null | V, selected: boolean }> | ReadonlyArray<V>

	}>>) => void

]>

export type OptionsOpts=Partial<Readonly<{

	type: Type
	size: number

}>>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *  generic expression: type must be specified
 */
export function useOptions<

	T extends Value,
	V extends Value

>(
	collection: Collection<T>,
	expression: string,
	opts: OptionsOpts & Readonly<{ type: Type<V> }>
): Options<V>;

/*
 * expression is a model field: type is inferred, unless specified
 */
export function useOptions<

	T extends Value,
	K extends string,
	V extends Value

>(
	collection: Collection<T & { [key in K]: undefined | V }>,
	expression: K & keyof T,
	opts?: OptionsOpts
): Options<V>;

export function useOptions<

	T extends Value,
	K extends string,
	V extends Value

>(collection: Collection<V>, expression: string, {

	type,
	size=0

}: OptionsOpts={}): Options<V> {

	const [{ model, query, items }, setCollection]=collection;

	const effective=type ?? toType(getModel(model, expression)
		?? error(new RangeError(`unknown model for <${model}>[${expression}]`))
	);

	const label=isEntry(effective.model) ? `${expression}.label` : expression;
	const filter=`?${expression}`;
	const values=asArray<null | Value>(query[filter]); // encoded values

	const [keywords, setKeywords]=useState("");
	const [offset, setOffset]=useState(0);
	const [limit, setLimit]=useCache(size);


	const specs={

		"count=count:": 0,
		[`value=${expression}`]: effective.model,

		[`~${label}`]: keywords,

		"^": {
			"count": "decreasing",
			[label]: "increasing"
		},

		"@": offset,
		"#": limit > 0 ? limit + 1 : 0

	} as unknown as { value: null | Value, count: number };

	const baseline=decode(items(specs)); // ignoring all facets
	const matching=decode(items({ ...query, [filter]: undefined, ...specs })); // ignoring all but this facet

	const ready=baseline !== undefined && matching !== undefined;

	const _items=ready ? [

		...matching // selected and matching
			.filter(({ selected }) => selected),

		...baseline // selected and not matching
			.filter(({ selected }) => selected)
			.filter(({ value: x }) => !matching.some(({ value: y }) => equals(x, y)))
			.map(({ value }) => ({ value, count: 0, selected: true })),

		...matching // not selected and matching
			.filter(({ selected }) => !selected),

		...baseline // not selected and not matching
			.filter(({ selected }) => !selected)
			.filter(({ value: x }) => !matching.some(({ value: y }) => equals(x, y)))
			.map(({ value }) => ({ value, count: 0, selected: false }))

	] : undefined;


	return [

		{

			ready,

			type: effective,

			keywords,
			limit,
			offset,

			items: limit === 0 ? _items : _items?.slice(0, limit),

			more: _items !== undefined && limit > 0 && _items.length > limit

		},

		delta => {

			if ( delta === undefined ) {

				setKeywords("");
				setOffset(0);
				setLimit(size);

				setCollection({ query: { [filter]: undefined } });

			} else {

				const {

					keywords,
					offset,
					limit,

					selection

				}=delta;

				if ( keywords !== undefined ) {

					setKeywords(keywords);

					if ( keywords === "" && offset === undefined ) { setOffset(0); }

				}

				if ( offset !== undefined ) {
					setOffset(Math.max(0, offset));
				}

				if ( limit !== undefined ) {
					setLimit(Math.max(0, limit));
				}


				if ( selection !== undefined ) {

					const effective=resolve(selection);

					setCollection({ query: { [filter]: effective.length === 0 ? undefined : effective } });


					function resolve(selection: Readonly<{
						value: null | V,
						selected: boolean
					}> | ReadonlyArray<V>): ReadonlyArray<null | Value> {

						if ( isArray<V>(selection) ) {

							return selection;

						} else { // !!! type inference

							const value: V=(selection as any).value;
							const selected: boolean=(selection as any).selected;

							return [
								...(values ?? []).filter(v => !equals(v, value)),
								...(selected ? [value] : [])
							];

						}
					}

				}

			}

		}

	];


	function decode(items: undefined | ReadonlyArray<{ value: null | Value, count: number }>): undefined | Option<V>[] {
		return items?.map(({ value, count }) => ({

			value: value === null ? null : effective.decode(value),
			count: isNumber(count) && count >= 0 ? count : 0,

			selected: values?.some(v => equals(v, value)) ?? false

		}));
	}

	function equals(x: unknown, y: unknown) {
		return isEntry(x) && isEntry(y) ? x.id === y.id : x === y;
	}

}



