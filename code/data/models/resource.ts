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

import { isEmpty } from "@metreeca/core";
import { Entry, isEntry } from "@metreeca/core/entry";
import { clean, Frame } from "@metreeca/core/frame";
import { useGraph } from "@metreeca/data/contexts/graph";
import { useTrace } from "@metreeca/data/contexts/trace";
import { Trace } from "@metreeca/link";
import { useEffect, useState } from "react";


export type Resource<T extends Frame, C extends Frame=Frame>=Readonly<[

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

	T extends Entry,
	C extends Frame

>(entry: T): Resource<T, C> {

	const id=new URL(entry.id, location.href).pathname; // normalize relative ids

	// !!! validate model (e.g. query well=formedness)

	const graph=useGraph();
	const [, setTrace]=useTrace();

	const [cache, setCache]=useState<T>();


	useEffect(() => graph.observe(() => retrieve()), []);

	useEffect(() => { retrieve(); }, [id, JSON.stringify(entry)]);


	function retrieve() {

		return graph.retrieve({ ...entry, id })

			.then(frame => {

				setCache({ ...frame, id });

				return id;

			})

			.catch(report);

	}

	function report(trace: Trace) {

		setTrace(trace);

		return id;

	}


	return [

		cache,

		(delta?) => {

			if ( delta === undefined ) {

				return retrieve();

			} else if ( isEmpty(delta) ) {

				return graph.delete({ id }).catch(report);

			} else if ( isEntry(delta) ) { // !!! validate model (e.g. no queries)

				return graph.update(clean({ ...entry, ...delta, id })).catch(report);

			} else { // !!! validate model (e.g. no queries)

				return graph.create(clean({ ...delta, id })).catch(report);

			}

		}

	];

}


