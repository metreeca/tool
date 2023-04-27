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

import { asArray }  from "@metreeca/core";
import { Entry }    from "@metreeca/core/entry";
import { Value }    from "@metreeca/core/value";
import { useGraph } from "@metreeca/data/contexts/graph";
import { useTrace } from "@metreeca/data/contexts/trace";


export type Matches<V extends Value>=(specs: Readonly<{

	keywords: string

	offset?: number
	limit?: number

}>) => Promise<V[]>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// !!! typing (field not in entry | entry[field]: Entry[]

export function useMatches<V extends Value>(entry: Entry, field: string): Matches<V> {

	const graph=useGraph();
	const [, setTrace]=useTrace();

	return ({ keywords, offset=0, limit=0 }) => !keywords.trim() ? Promise.resolve([]) : graph

		.retrieve({

			id: entry.id,

			[field]: [{

				"~label": keywords,

				"^": { "label": "increasing" },
				"@": offset,
				"#": limit,

				id: "",
				label: ""

			}]

		})

		.then(frame => asArray<V>(frame[field]) ?? [])

		.catch(trace => {

			setTrace(trace);

			return [];

		});

}