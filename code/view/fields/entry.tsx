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


import { Entry, id, label }     from "@metreeca/core/entry";
import { Setter }               from "@metreeca/data/hooks";
import { Matches }              from "@metreeca/data/models/matches";
import { createField, Field }   from "@metreeca/view/fields/index";
import { ToolAuto }             from "@metreeca/view/widgets/auto";
import { focus, input }         from "@metreeca/view/widgets/form";
import { ClearIcon }            from "@metreeca/view/widgets/icon";
import React, { createElement } from "react";
import "./index.css";


export function ToolEntry({

	disabled,
	readonly,

	placeholder,
	validity,

	source,

	...field

}: Field<Entry> & Readonly<{

	source: Matches<Entry>

}>) {

	return createElement("tool-entry", {},
		createField<Entry>({ field, reader, editor })
	);


	function reader({ value }: { value: Entry }) { // wrap in span to manage clipping
		return readonly
			? <span key={id(value)}>{label(value)}</span>
			: <span key={id(value)}><a href={id(value)}>{label(value)}</a></span>;
	}

	function editor({

		required,

		state: [value, setValue]

	}: {

		required?: boolean

		state: [undefined | Entry, Setter<undefined | Entry>],

	}) {


		function insert(entry: Entry) {
			setValue(entry);
		}

		function remove() {
			setValue(undefined);
		}


		return value

			? <>

				<input type={"text"} readOnly required={required} spellCheck={"false"} value={label(value)}/>

				<button title={"Remove"} onClick={e => {

					try { remove(); } finally {

						input(e.currentTarget);
						focus(e.currentTarget.previousElementSibling);

					}

				}}><ClearIcon/></button>

			</>

			: <ToolAuto required={required}

				onSelect={value => insert(value)}

			>{source}</ToolAuto>;

	}

}


