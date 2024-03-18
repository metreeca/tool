/*
 * Copyright © 2020-2024 Metreeca srl
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

import { useCache } from "@metreeca/data/hooks/cache";
import { useTrailing } from "@metreeca/data/hooks/events";
import { Keywords } from "@metreeca/data/models/keywords";
import { AutoDelay } from "@metreeca/view";
import { ClearIcon, SearchIcon } from "@metreeca/view/widgets/icon";
import * as React from "react";
import { createElement } from "react";
import "./keywords.css";


/**
 * Creates a search input field.
 *
 * @constructor
 */
export function ToolKeywords({

	disabled,

	placeholder,

	auto,

	children: [keywords, setKeywords]

}: {

	disabled?: boolean

	placeholder?: string

	/**
	 * The delay in ms before changes are auto-submitted after the last edit.
	 */
	auto?: number

	children: Keywords

}) {

	const [input, setInput]=useCache(keywords);


	function search(keywords: string) {
		setKeywords(keywords);
	}

	function clear() {
		setKeywords("")
	}


	return createElement("tool-keywords", {

		disabled: disabled ? "disabled" : undefined

	}, <>

		<nav><SearchIcon/></nav>

		<input type="text" disabled={disabled}

			value={input}
			placeholder={placeholder}

			onFocus={e => e.currentTarget.select()}
			onInput={e => setInput(e.currentTarget.value)}

			onInputCapture={useTrailing(auto ?? AutoDelay, e => {

				search(e.currentTarget.value.trim());

			}, [setKeywords])}

		/>

		<nav>{input && <button title="Clear" onClick={clear}><ClearIcon/></button>}</nav>

	</>);
}