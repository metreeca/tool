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

import { isDefined } from "@metreeca/core";
import { Frame, id, isEntry, Order, toFrameString } from "@metreeca/core/entry";
import { isString } from "@metreeca/core/string";
import { useCache } from "@metreeca/data/hooks/cache";
import { Collection } from "@metreeca/data/models/collection";
import { Selection } from "@metreeca/data/models/selection";
import { ToolHint } from "@metreeca/view/widgets/hint";
import { ToolMore } from "@metreeca/view/widgets/more";
import React, { createElement, Fragment, ReactNode, useState } from "react";
import "./sheet.css";


const LimitInit=25;
const LimitNext=10;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolSheet<V extends Frame>({

	placeholder,

	sorted,

	as=toFrameString,

	children: [collection]

}: {

	placeholder?: ReactNode

	sorted?: string | Order

	as?: (item: V) => ReactNode

	selection?: Selection<V>
	children: Collection<V>

}) {

	const [offset, setOffset]=useState(0); // !!! sliding window
	const [limit, setLimit]=useState(LimitInit);

	const [items]=useCache(collection.items({

		...collection.model,
		...collection.query,

		"^": isString(sorted) ? { [sorted as string]: "increasing" }
			: isDefined(sorted) ? sorted
				: isEntry(collection.model) ? { label: "increasing" }
					: undefined,

		"@": offset,
		"#": limit + 1

	}));

	const more=items && items.length > limit;


	function load() {
		setLimit(limit + LimitNext);
	}


	return items?.length ? createElement("tool-sheet", {}, <>

		{items?.map((item, index) => <Fragment key={isEntry(item) ? id(item) : JSON.stringify(item)}>{

			as(item)

		}</Fragment>)}

		{more && <ToolMore onLoad={load}/>}

	</>) : placeholder ? <ToolHint>{placeholder}</ToolHint> : null;

}


