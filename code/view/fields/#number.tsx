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

import { Maybe } from "@metreeca/link";
import * as React from "react";
import { createElement } from "react";
import { Input, ToolInput, ToolPlaceholder } from "@metreeca/tile/inputs/input";
import "./#date.css";
import "./input.css";


export function ToolNumber({

	editable=false,
	disabled=false,
	readonly=false,
	required=false,
	multiple=false,

	placeholder,

	min,
	max,
	step,

	state: [value, setValue]=[0, () => {}],

	validity=() => ""

}: Input<Maybe<number>> & {

	readonly min?: number
	readonly max?: number

	readonly step?: number

}) {

	function reader() {

		const precision=Math.max(0, -Math.floor(Math.log10(Math.abs(step || 1))));

		return value === undefined

			? <ToolPlaceholder>{placeholder}</ToolPlaceholder>

			: <span>{toLocaleNumberString(value, { precision })}</span>;

	}

	function editor() {

		function parse(value?: string): Maybe<number> {
			return !value ? undefined : parseFloat(value);
		}

		return <input type={"number"}

			// !!! ref={instance => instance?.setCustomValidity(validity(value))}

			disabled={disabled} readOnly={readonly} required={required}
			min={min} max={max} step={step}

			placeholder={placeholder} value={value ?? ""}

			onChange={e => {

				const current=parse(e.currentTarget.value);

				e.currentTarget.setCustomValidity(validity?.(current));
				e.currentTarget.reportValidity();

				setValue(current);

			}}

		/>;
	}

	return createElement("tool-number", { class: ToolInput }, editable ? editor() : reader());

}