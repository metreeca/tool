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

import { asInteger, isInteger, toIntegerString } from "@metreeca/core/integer";
import { Setter }                                from "@metreeca/data/hooks";
import { createField, createPlaceholder, Field } from "@metreeca/view/fields/index";
import { ClearIcon }                             from "@metreeca/view/widgets/icon";
import * as React                                from "react";
import { createElement, useState }               from "react";
import "./index.css";


export function ToolInteger({

	disabled,
	readonly,

	placeholder,
	validity,

	min,
	max,
	step,

	...field

}: Field<number> & Readonly<{

	min?: number
	max?: number

	step?: number

}>) {

	return createElement("tool-integer", {},
		createField<number>({ field, reader, editor })
	);


	function reader({ value }: { value: undefined | number }) {
		return value === undefined
			? createPlaceholder(placeholder)
			: <span>{toIntegerString(Math.trunc(value))}</span>;
	}

	function editor({

		required,

		state: [value, setValue]

	}: {

		required?: boolean

		state: [undefined | number, Setter<undefined | number>],

	}) {

		const [initial]=useState(value);


		function clear() {
			setValue(undefined);
		}


		const digits=asInteger(Math.ceil(Math.log10(
			Math.max(Math.abs(min ?? NaN) || 0, Math.abs(max ?? NaN) || 0)
		) || 0));

		return <>

			<input type={"number"} readOnly={readonly} required={required}

				size={digits}

				value={value ?? ""}
				placeholder={placeholder}
				pattern={"[\\-+]\\d+"}

				min={asInteger(Math.trunc(min ?? NaN))}
				max={asInteger(Math.trunc(max ?? NaN))}

				step={asInteger(Math.trunc(step ?? NaN))}

				onChange={e => setValue(asInteger(parseInt(e.currentTarget.value)))}

				style={{

					width: isInteger(digits) ? `${digits + 1}em` : undefined // allot space for sign

				}}

			/>

			{initial && initial === value && <button title={"Clear"} onClick={e => {

				try { clear(); } finally {

					const previous=e.currentTarget.previousElementSibling;

					if ( previous instanceof HTMLElement ) {
						previous.focus();
					}

				}

			}}><ClearIcon/></button>}

		</>;

	}

}


