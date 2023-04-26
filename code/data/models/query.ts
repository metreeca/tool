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

import { asFrame, Frame } from "@metreeca/core/entry";
import { useRoute }       from "@metreeca/data/contexts/router";
import { Setter }         from "@metreeca/data/hooks";
import { useState }       from "react";


export function useQuery(): [Frame, Setter<Frame>] {

	const [route]=useRoute();

	const [query, setQuery]=useState(asFrame(history.state) ?? {});

	function setStore(query: Frame) {
		history.replaceState(query, document.title);
	}

	return [query, query => {
		setStore(query);
		setQuery(query);
	}];

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function encode(query: Frame): string {
	return encodeURI(JSON.stringify(query));
}

function decode(query: string): Frame {
	return JSON.parse(decodeURI(query) || "{}"); // !!! handle errors
}
