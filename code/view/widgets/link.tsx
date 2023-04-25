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

import { Entry, Frame, id, isEntry }     from "@metreeca/core/entry";
import { isString }                      from "@metreeca/core/string";
import { isValue, toValueString, Value } from "@metreeca/core/value";
import { useRoute }                      from "@metreeca/data/contexts/router";
import { Collection }                    from "@metreeca/data/models/collection";
import React, { ReactNode }              from "react";


export function ToolLink({

	icon,

	filter,

	children: value

}: {

	icon?: ReactNode

	filter?: [string | Entry | Collection<Value>, Frame]

	children: Value // reasonable when considering filtering links…

}) {

	const handler=(filter === undefined) ? undefined : action(filter);

	return <a href={isEntry(value) ? id(value) : undefined}

		onClick={e => {

			if ( handler ) {
				try { handler(); } finally { e.preventDefault(); }
			}

		}}

	>{icon ?
		<>{icon} <span>{toValueString(value)}</span></>
		: toValueString(value)
	}</a>;


	function action([target, query]: Exclude<typeof filter, undefined>) {
		return isValue(target) ? global([target, query]) : local([target, query]);
	}

	function global([target, query]: [string | Entry, Frame]) {

		const [, setRoute]=useRoute();

		const route=isString(target) ? target : target.id;

		return () => setRoute({ route, state: query });
	}

	function local([[collection, setCollection], query]: [Collection<Value>, Frame]) {

		const reset=Object.keys(collection.query).reduce((query, key) => ({

			...query, [key]: undefined

		}), {});

		return () => setCollection({

			query: { ...reset, ...query } // !!! review reset protocol

		});
	}

}
