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

import { isEmpty } from "@metreeca/core";
import { Entry, isEntry } from "@metreeca/core/entry";
import { toValueString, Value } from "@metreeca/core/value";
import React from "react";


export function ToolLink({

	search,

	children

}: {

	search?: [string | Entry, { readonly [path: string]: undefined | Value; }]

	children: Entry

}) {

	if ( children ) {

		const label=toValueString(children);

		if ( search ) {

			const target=search[0];
			const collection=isEntry(target) ? target.id : target;
			const constraints=search[1];

			const query=Object.entries(constraints)
				.filter(([, value]) => value !== undefined && value !== "")
				.reduce((query, [key, value]) => Object.assign(query, { [key]: isEntry(value) ? value.id : value }), {});

			const href=isEmpty(query) ? collection : `${collection}?${encodeURI(JSON.stringify(query))}`;

			return <a href={href} title={label}>{label}</a>;

		} else {

			return <a href={children.id} title={label}>{label}</a>;

		}

	} else {

		return null;

	}

}