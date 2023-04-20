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

import { Immutable, isArray } from "@metreeca/link";
import React, { createElement, Fragment, ReactNode } from "react";
import "./#grid.css";


export interface Entry {

	label: ReactNode,
	value: ReactNode

}


export function ToolGrid({

	large=false,
	small=false,

	children

}: {

	large?: boolean
	small?: boolean

	children: { [label: string]: ReactNode } | Immutable<Array<null | Entry>>

}) {

	const entries=isArray(children) ? children : Object.entries(children).map(([label, value]) =>
		({ label, value })
	);

	return createElement("tool-grid", {

		large: large ? "" : undefined,
		small: small ? "" : undefined

	}, entries.map((entry, index) => entry === null ? <hr key={index}/> : <Fragment key={index}>

		<dt>{entry.label}</dt>
		<dd>{entry.value}</dd>

	</Fragment>));

}