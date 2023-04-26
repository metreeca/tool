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

import { isEmpty }             from "@metreeca/core";
import { asFrame, Frame }      from "@metreeca/core/entry";
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

	const value=asFrame(history.state)
		?? decode(location.search.substring(1))
		?? decode(sessionStorage.getItem(key))
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
	return isEmpty(query) ? "" : encodeURI(JSON.stringify(query));
}

function decode(query: undefined | null | string): undefined | Frame {
	try {

		return query ? JSON.parse(decodeURI(query)) : undefined;

	} catch ( e ) {

		console.warn("malformed query sting <%o> / %o", query, e);

		return undefined;

	}
}
