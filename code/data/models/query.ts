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

import { isArray, isEmpty }    from "@metreeca/core";
import { Frame, isEntry }      from "@metreeca/core/entry";
import { isString }            from "@metreeca/core/string";
import { isValue, Value }      from "@metreeca/core/value";
import { useRouter }           from "@metreeca/data/contexts/router";
import { Setter }              from "@metreeca/data/hooks";
import { useEffect, useState } from "react";

/**
 * Persistent query storage.
 *
 * @module
 */

/**
 * Creates a persistent query store.
 */
export function useQuery(): [Frame, Setter<Frame>] {

	const [route]=useRouter();

	const key=`${route}#query`;

	const value=/*asFrame(history.state)
	 ??*/ decode(location.search.substring(1))
		// ?? decode(sessionStorage.getItem(key))
		?? {};


	const [query, setQuery]=useState(value);

	useEffect(() => { update(value); }, []);

	return [query, update];


	function update(query: Frame) {

		const search=encode(query);

		history.replaceState(query, document.title,
			search ? `${location.pathname}?${search}${location.hash}` : `${location.pathname}${location.hash}`
		);

		sessionStorage.setItem(key, search);

		setQuery(query);
	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// !!! compact encoding / handle versioning

function encode(query: Frame): string {

	if ( isEmpty(query) ) {

		return "";

	} else {

		const params=new URLSearchParams();

		Object.entries(query).forEach(([label, value]) => {

			if ( label.startsWith("<=") && isValue(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith(">=") && isValue(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith("<") && isValue(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith(">") && isValue(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith("~") && isString(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith("?") && isArray<null | Value>(value) ) {

				value.filter(v => v === null || isValue(v)).forEach(v =>
					params.append(label.substring(1), encode(v))
				);

			}

		});

		return params.toString();


		function encode(value: null | Value): string {
			return isEntry(value) ? value.id : JSON.stringify(value);
		}

	}

}

function decode(search: undefined | null | string): undefined | Frame {
	try {

		if ( search ) {

			const query: { [label: string]: Frame[string] }={};

			new URLSearchParams(search).forEach((value, label) => {

				if ( label.startsWith("<=") ) {

					query[label]=decode(value);

				} else if ( label.startsWith(">=") ) {

					query[label]=decode(value);

				} else if ( label.startsWith("<") ) {

					query[label]=decode(value);

				} else if ( label.startsWith(">") ) {

					query[label]=decode(value);

				} else if ( label.startsWith("~") ) {

					query[label]=decode(value);

				} else if ( label.startsWith("?") ) {

					query[label]=[...(query[label] as [] ?? []), decode(value)];

				} else {

					query[`?${label}`]=[...(query[label] as [] ?? []), decode(value)];

				}

			});

			return query;


			function decode(value: string): null | Value {
				return value.match(/^\/|^\w+:/) ? { id: value } : JSON.parse(value);
			}

		} else {

			return undefined;

		}

	} catch ( e ) {

		console.warn("malformed search string <%o> / %o", search, e);

		return undefined;

	}
}
