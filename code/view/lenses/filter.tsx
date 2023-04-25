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

import { Frame }                from "@metreeca/core/entry";
import { toValueString, Value } from "@metreeca/core/value";
import { Collection }           from "@metreeca/data/models/collection";
import React                    from "react";

/**
 * Creates a collection filtering link.
 *
 * @param label
 * @param query
 * @param collection
 * @param setCollection
 * @constructor
 */
export function ToolFilter<V extends Value>({

	label,
	query,

	children: [collection, setCollection]

}: {

	label: Value
	query: Frame

	children: Collection<V>

}) {

	function filter() {
		setCollection({

			query: {

				...(Object.keys(collection.query).reduce((query, key) => ({ ...query, [key]: undefined }), {})),
				...query

			}

		});
	}

	return <a onClick={e => {

		try { filter(); } finally { e.preventDefault();}

	}}>{toValueString(label)}</a>;

}
