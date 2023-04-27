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


import { Entry, id, label }   from "@metreeca/core/entry";
import { useGraph }           from "@metreeca/data/contexts/graph";
import { useTrace }           from "@metreeca/data/contexts/trace";
import { Setter }             from "@metreeca/data/hooks";
import { AutoSize }           from "@metreeca/view";
import { createField, Field } from "@metreeca/view/fields/index";
import { ToolAuto }           from "@metreeca/view/widgets/auto";
import { input }              from "@metreeca/view/widgets/form";
import { ClearIcon }          from "@metreeca/view/widgets/icon";
import * as React             from "react";
import { createElement }      from "react";
import "./index.css";


export function ToolEntry<E extends Entry>({

	disabled,
	readonly,

	placeholder,
	validity,

	source,

	...field

}: Field<E> & Readonly<{

	source: string

}>) {

	return createElement("tool-entry", {},
		createField<E>({ field, reader, editor })
	);


	function reader({ value }: { value: E }) { // wrap in span to manage clipping
		return readonly
			? <span key={id(value)}>{label(value)}</span>
			: <span key={id(value)}><a href={id(value)}>{label(value)}</a></span>;
	}

	function editor({

		required,

		state: [value, setValue]

	}: {

		required?: boolean

		state: [undefined | E, Setter<undefined | E>],

	}) {

		const graph=useGraph();

		const [, setTrace]=useTrace();


		function doInsert(entry: E) {
			setValue(entry);
		}

		function doRemove() {
			setValue(undefined);
		}


		return value

			? <>

				<input type={"text"} readOnly required={required} value={label(value)}/>

				<button title={"Clear"} onClick={e => {

					try {

						doRemove();

					} finally {

						input(e.currentTarget);

					}

				}}><ClearIcon/></button>

			</>

			: <ToolAuto required={required}

				onSelect={({ value, label }) => doInsert({ id: value, label } as E)}

			>{keywords => graph

				.retrieve({

					id: source,

					"~label": keywords,
					".order": "label",
					".limit": AutoSize,

					contains: [{
						id: "",
						label: ""
					}]

				})

				.then(entries => entries.contains?.length
					? entries.contains.map(entry => ({ value: id(entry), label: label(entry) }))
					: null
				)

				.catch(trace => {

					setTrace(trace);

					throw trace;

				})


			}</ToolAuto>;

	}

}
