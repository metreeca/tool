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

import { isArray }                         from "@metreeca/core";
import React, { createElement, ReactNode } from "react";

import "./info.css";


interface ToolInfoEntry {
	label: ReactNode,
	value: ReactNode
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Resource info box.
 *
 * @param children
 * @constructor
 */
export function ToolInfo({

	children

}: {

	children: undefined | { [label: string]: ReactNode } | Array<{ title: ReactNode, value: ReactNode }>

}) {

	if ( children ) {

		const entries: ToolInfoEntry[] = isArray<ToolInfoEntry>(children)
			? children
			: Object.entries(children).map(([label, value]) => ({ label, value }));

		return createElement("tool-info", {}, entries

			.filter(({ value }) => value)

			.map(({ label, value }, index) => <div key={index}>

				<dt>{label}</dt>
				<dd>{value}</dd>

			</div>)
		);

	} else {

		return null;

	}

}