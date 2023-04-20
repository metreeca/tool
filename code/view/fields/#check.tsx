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
import "./#check.css";
import "./input.css";


export function ToolCheck({

	editable=false,
	readonly=false,
	required=false,

	state: [value, setValue],

	labels

}: (Input<boolean> | Input<Maybe<boolean>>) & {

	labels?: { false: string, true: string }

}) {

	function reader() {
		return labels === undefined ? checkbox()
			: value === false ? <span>{labels["false"]}</span>
				: value === true ? <span>{labels["true"]}</span>
					: <ToolPlaceholder/>;
	}

	function editor() {
		return labels === undefined ? checkbox()
			: <select value={value === false ? "false" : value === true ? "true" : undefined}

				onChange={e => setValue(e.currentTarget.value === "true")}

			>

				<option value={"false"}>{labels["false"]}</option>
				<option value={"true"}>{labels["true"]}</option>

			</select>;
	}

	function checkbox() {
		return <input type={"checkbox"}
			disabled={!editable || readonly} readOnly={readonly} required={required}
			checked={value} onChange={e => setValue(e.currentTarget.checked)}
		/>;
	}

	return createElement("tool-check", { class: ToolInput }, editable ? editor() : reader());

}