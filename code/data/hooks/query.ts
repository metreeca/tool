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

import { decodeQuery, encodeQuery, Frame, isFrame, Query, toQuery } from "@metreeca/core/frame";
import { useRouter } from "@metreeca/data/contexts/router";
import { Setter } from "@metreeca/data/hooks/index";
import { useEffect, useState } from "react";

/**
 * Persistent query storage.
 *
 * @module
 */

/**
 * Creates a persistent query store.
 */
export function useQuery(): [Query, Setter<Query>] {

	const [route]=useRouter();

	const key=`${route}#query`;

	const [query, setQuery]=useState(
		(isFrame(history.state) ? toQuery(history.state) : undefined)
		?? decodeQuery(location.search.substring(1))
		?? decodeQuery(sessionStorage.getItem(key))
		?? {}
	);


	useEffect(() => { update(query); }, []);

	return [query, update];


	function update(query: Frame) {

		const search=encodeQuery(query);

		history.replaceState(query, document.title,
			search ? `${location.pathname}?${search}${location.hash}` : `${location.pathname}${location.hash}`
		);

		sessionStorage.setItem(key, search);

		setQuery(query);
	}

}
