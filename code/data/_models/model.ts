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


import { isArray, isDefined, isEmpty, isObject } from "@metreeca/core";
import { Frame } from "@metreeca/core/frame";
import { isNumber } from "@metreeca/core/number";
import { isString } from "@metreeca/core/string";
import { Value } from "@metreeca/core/value";
import { Setter } from "@metreeca/data/hooks";


import { useState } from "react";


export function useModel<F extends Frame>(frame: F): [F, (frame: F) => void];
export function useModel<F extends Frame>(frame: undefined | F): [undefined | F, (frame: F) => void];

export function useModel<F extends Frame>(frame: undefined | F): [undefined | F, (frame: F) => void] {

	return useState(prune(frame));

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Prune model frames, recursively removing default values.
 *
 * @param model
 */
function prune<F extends Frame>(model: undefined | F): typeof model {

	return model === undefined ? undefined : Object.entries(model).reduce((pruned, [label, value]) => {

		return { ...pruned, [label]: prune(value) };

	}, {} as F);


	function prune<V extends Value>(value: Frame[string]): typeof value {

		if ( isNumber(value) ) {

			return value === 0 || isNaN(value) ? undefined : value;

		} else if ( isString(value) ) {

			return value || undefined;

		} else if ( isArray<Value>(value) ) {

			const pruned=value.map(prune).filter(v => v !== undefined);

			return isEmpty(pruned) ? undefined : pruned as typeof value;

		} else if ( isObject(value) ) {

			const pruned=Object.entries(value).reduce((accumulator, [label, value]) => {

				const pruned=prune(value);

				return pruned === undefined ? accumulator : { ...accumulator, [label]: pruned };

			}, {});

			return isEmpty(pruned) ? undefined : pruned as typeof value;

		} else {

			return undefined;

		}

	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type Fields<E extends Frame>={ [K in keyof E]: [E[K], Setter<E[K]>] }


export function fields<F extends Frame>([value, setValue]: [F, Setter<F>]): Fields<F> {
	return Object.entries(value).reduce((fields, [k, v]) => ({

		...fields,

		[k]: [v, (u: typeof v) => setValue({ ...value, [k]: u })]

	}), {} as Fields<typeof value>);
}

export function _fields<F extends Frame, R>(
	[value, setValue]: [undefined | F, Setter<F>],
	mapper: ((fields: Fields<F>) => R)
): undefined | R {

	return isDefined(value)

		? mapper(fields<F>([value, setValue]))

		: undefined;

}