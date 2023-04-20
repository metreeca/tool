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
import { classes } from "../../../../../Projects/EC2U/Data/src/main/javascript/@metreeca/tool";
import "./input.css";
import "./#options.css";


export function ToolOptions({

	editable=false,
	readonly=false,
	required=false,
	multiple=false,

	placeholder,
	labels={},

	state: [value, setValue]=[undefined, () => {}]

}: Input<string> & {

	labels: { [value: string]: string }

}) {

	function reader() {
		return value === undefined
			? <ToolPlaceholder>{placeholder}</ToolPlaceholder>
			: <span>{labels[value] || value}</span>;
	}

	function editor() {
		return <select className={classes({ default: !value })} value={value}

			disabled={readonly} required={required}

			onChange={e => setValue(e.currentTarget.value || undefined)}

		>

			{placeholder && <option value={""}>{placeholder}</option>}

			{Object.entries(labels).map(([_value, _label]) =>
				<option key={_value} value={_value}>{_label}</option>
			)}

		</select>;
	}

	return createElement("tool-options", { class: ToolInput }, editable ? editor() : reader());

}