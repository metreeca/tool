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

import { Setter }                                from "@metreeca/data/hooks";
import { createField, createPlaceholder, Field } from "@metreeca/view/fields/index";
import { ClearIcon }                             from "@metreeca/view/widgets/icon";
import * as React                                from "react";
import { createElement, useState }               from "react";
import "./index.css";


export function ToolEmail({

	disabled,
	readonly,

	placeholder,
	validity,

	pattern,

	...field

}: Field<string> & Readonly<{

	cols?: number
	rows?: number

	pattern?: string | RegExp

}>) {

	return createElement("tool-email", {},
		createField<string>({ field, reader, editor })
	);


	function reader({ value }: { value: string }) {
		return value?.trim()
			? <a href={`mailto:${value}`}>{value}</a>
			: createPlaceholder(placeholder);
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

			{initial && initial === value && <button title={"Clear"} onClick={e => { // !!! factor

				try { doClear(); } finally {

					const previous=e.currentTarget.previousElementSibling;

					if ( previous instanceof HTMLElement ) {
						previous.focus();
					}

				}

			}}><ClearIcon/></button>}

			<input type={"email"} readOnly={readonly} required={required}

				value={value ?? ""}
				placeholder={placeholder}
				pattern={"\\w[\\-\\w]*(\\.\\w[\\-\\w]*)*@\\w[\\-\\w]*(\\.\\w[\\-\\w]*)+"}

				onFocus={e => e.target.select()}
				onChange={e => setValue(e.currentTarget.value || undefined)}

				style={{

					minWidth: "15em"

				}}

			/>

		</>;

	}

}


