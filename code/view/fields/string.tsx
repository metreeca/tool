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

import { Setter } from "@metreeca/data/hooks";
import { createField, Field, ToolFieldClass } from "@metreeca/view/fields/index";
import { focus, input } from "@metreeca/view/widgets/form";
import { ClearIcon } from "@metreeca/view/widgets/icon";
import * as React from "react";
import { createElement, useState } from "react";
import "./index.css";
import "./string.css";


export function ToolString({

	disabled,
	readonly,

	placeholder,
	validity,

	cols,
	rows,

	pattern,

	...field

}: Field<string> & {

	cols?: number
	rows?: number

	pattern?: string | RegExp

}) {

	return createElement("tool-text", { class: ToolFieldClass },
		createField<string>({ field, reader, editor })
	);


	function reader({ value }: { value: string }) {
		return rows && rows > 1
			? <div>{value}</div>
			: <span>{value}</span>;
	}

	function editor({

		required,

		state: [value, setValue]

	}: {

		required?: boolean

		state: [undefined | string, Setter<undefined | string>],

	}) {

		const [initial]=useState(value);


		function doClear() {
			setValue(undefined);
		}


		return <>

			{rows && rows > 1

				? <textarea readOnly={readonly} required={required}

					cols={cols} rows={rows}

					value={value ?? ""}
					placeholder={placeholder}

					onChange={e => setValue(e.currentTarget.value || undefined)}

				/>

				: <input type={"text"} readOnly={readonly} required={required}

					size={cols}

					value={value ?? ""}
					placeholder={placeholder}
					pattern={pattern instanceof RegExp ? pattern.source : pattern}

					onChange={e => setValue(e.currentTarget.value || undefined)}

				/>

			}

			{initial && initial === value && <button title={"Clear"} onClick={e => {

				try { doClear(); } finally {

					input(e.currentTarget);
					focus(e.currentTarget.previousSibling);

				}

			}}><ClearIcon/></button>}

		</>;

	}

}



