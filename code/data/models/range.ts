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

import { error, isDefined, toType, Type } from "@metreeca/core";
import { evaluate, isValue, Value } from "@metreeca/core/value";
import { useCache } from "@metreeca/data/hooks/cache";
import { Collection } from "@metreeca/data/models/collection";


export type Range<V extends Value>=Readonly<[

	Readonly<{

		ready: boolean

		type: Type

		min: undefined | V
		max: undefined | V

		gte: undefined | V
		lte: undefined | V

	}>,

	(delta?: Partial<Readonly<{

		gte: null | V
		lte: null | V

	}>>) => void

]>

export type RangeOpts=Partial<Readonly<{

	type: Type

}>>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 *  generic expression: type must be specified
 */
export function useRange<

	T extends Value,
	V extends Value,
	X // !!! vs T?

>(
	collection: Collection<T>,
	expression: string,
	opts: RangeOpts & Readonly<{ type: Type<V,X > }>
): Range<V>;

/*
 * expression is a model field: type is inferred, unless specified
 */
export function useRange<

	T extends Value,
	K extends string,
	V extends Value

>(
	collection: Collection<T & { [key in K]: undefined | V }>,
	expression: K & keyof T,
	opts?: RangeOpts
): Range<V>;

export function useRange<V extends Value>(collection: Collection<V>, expression: string, {

	type

}: RangeOpts={}): Range<V> {

	const [{ model, query, items }, setCollection]=collection;

	const effective=type ?? toType(evaluate(model, expression)
		?? error(new RangeError(`unknown model for <${model}>[${expression}]`))
	);

	const lower=`>>${expression}`;
	const upper=`<<${expression}`;

	const gte=query[lower];
	const lte=query[upper];


	const value=items({

		...query,

		[`min=min:${expression}`]: effective.model,
		[`max=max:${expression}`]: effective.model

	});

	const [min]=useCache(value?.[0]?.min);
	const [max]=useCache(value?.[0]?.max);

	return [

		{

			ready: value !== undefined,

			type: effective,

			min: isDefined(min) && isValue(min) ? effective.decode(min) : undefined,
			max: isDefined(max) && isValue(max) ? effective.decode(max) : undefined,

			gte: isDefined(gte) && isValue(gte) ? effective.decode(gte) : undefined,
			lte: isDefined(lte) && isValue(lte) ? effective.decode(lte) : undefined

		},

		delta => {

			if ( delta === undefined ) {

				setCollection({ query: { [lower]: undefined, [upper]: undefined } });

			} else {

				if ( delta.gte !== undefined || delta.lte !== undefined ) {
					setCollection({

						query: {

							[lower]: delta.gte === undefined ? gte
								: delta.gte === null ? undefined
									: effective.encode(delta.gte),

							[upper]: delta.lte === undefined ? lte
								: delta.lte === null ? undefined
									: effective.encode(delta.lte)
						}

					});
				}

			}

		}

	];

}


