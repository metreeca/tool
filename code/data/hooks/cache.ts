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

import { equals as deepEquals } from "@metreeca/core";
import { Setter } from "@metreeca/data/hooks";
import { useState } from "react";


/**
 *
 * @param value
 * @param equals
 *
 * @see https://betterprogramming.pub/updating-state-from-properties-with-react-hooks-5d48693a4af8
 * @see https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
 */
export function useCache<V>(value: V, equals: (x: V, y: V) => boolean=deepEquals): [V, Setter<V>] {

	const [internal, setInternal]=useState(value);
	const [previous, setPrevious]=useState(value);

	if ( value !== undefined && !equals(value, previous) ) {
		setInternal(value);
		setPrevious(value);
	}

	return [internal, setInternal];
}