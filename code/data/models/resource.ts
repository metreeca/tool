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

import { isArray, isEmpty, isObject } from "@metreeca/core";
import { Frame, isEntry } from "@metreeca/core/entry";
import { Value } from "@metreeca/core/value";
import { useGraph } from "@metreeca/data/contexts/graph";
import { prune } from "@metreeca/data/models/index";
import { useEffect, useState } from "react";


export type Resource<T extends Frame, C extends Frame>=Readonly<[

		undefined | T,

	{

		(): Promise<string> // reload

		(frame: { id: never } & C): Promise<string>  // create
		(frame: { id: string } & Partial<T>): Promise<string> // update
		(empty: { [key in any]: never }): Promise<string> // delete

	}

]>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useResource<

	T extends Frame,
	C extends Frame

>(model: T, {

	id=""

}: Partial<{

	id: string

}>={}): Resource<T, C> {

	const graph=useGraph();

	const [entry, setEntry]=useState<T>();


	useEffect(() => { retrieve(); }, [JSON.stringify(model)]);


	function retrieve() {

		return graph.retrieve({ ...model, id }).then(entry => {

			setEntry({ ...prune(model), ...entry }); // retain undefined field placeholders to drive editing

			return id;

		});

	}


	return [

		entry,

		(delta?) => {

			if ( delta === undefined ) {

				return retrieve();

			} else if ( isEmpty(delta) ) {

				return graph.delete({ id });

			} else if ( isEntry(delta) ) {

				return graph.update(clean({ ...model, ...delta, id }));

			} else {

				return graph.create(clean({ ...delta, id }));

			}

		}

	];

}


//// !!! to Graph //////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Clean frames, recursively removing non-id fields from nested frames.
 *
 * @param frame
 */
function clean<F extends Frame>(frame: F): typeof frame {

	return Object.entries(frame).reduce((f, [label, value]) => {

		return { ...f, [label]: clean(value) };

	}, {} as F);


	function clean(value: Frame[string]): typeof value { // retain only entry identifiers

		if ( isObject(value) && "id" in value ) {

			return { id: value.id };

		} else if ( isArray<Value>(value) ) {

			return value.map(clean) as Value[];

		} else {

			return value;

		}

	}

}

