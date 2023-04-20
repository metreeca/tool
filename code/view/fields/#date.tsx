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

import * as React from "react";
import { createElement } from "react";
import { Input, ToolInput, ToolPlaceholder } from "@metreeca/tile/inputs/input";
import "./#date.css";
import "./input.css";


export function ToolDate({

	editable=false,
	disabled=false,
	readonly=false,

	required=false,
	multiple=false,

	placeholder,

	state: [value, setValue]=["", () => {}],

	validity=() => ""

}: Input<string> & {

	readonly validity?: (value: string) => string

}) {

	function reader() {
		return value
			? <span>{toLocaleDateString(new Date(value))}</span>
			: <ToolPlaceholder>{placeholder}</ToolPlaceholder>;
	}

	function editor() {
		return <input type={"date"}

			disabled={disabled} readOnly={readonly} required={required}

			placeholder={placeholder} value={value || ""}

			onChange={e => {

				e.currentTarget.setCustomValidity(validity?.((e.target.value)));
				e.currentTarget.reportValidity();

				setValue(e.target.value);

			}}

		/>;
	}

	return createElement("tool-date", { class: ToolInput }, editable ? editor() : reader());

}