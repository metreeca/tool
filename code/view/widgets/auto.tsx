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


import { toValueString, Value }                      from "@metreeca/core/value";
import { useTrailing }                               from "@metreeca/data/hooks/events";
import { Matches }                                   from "@metreeca/data/models/matches";
import { AutoDelay, AutoLength, AutoSize, keys }     from "@metreeca/view";
import { focus, input }                              from "@metreeca/view/widgets/form";
import { ClearIcon }                                 from "@metreeca/view/widgets/icon";
import { ToolSpin }                                  from "@metreeca/view/widgets/spin";
import React, { createElement, ReactNode, useState } from "react";
import "./auto.css";

/**
 * Creates an auto-completing input field.
 *
 * @param disabled
 * @param required
 * @param placeholder
 * @param auto
 * @param onSelect
 * @param source
 * @constructor
 */
export function ToolAuto<V extends Value>({

	disabled,
	required,

	placeholder,

	auto,

	onSelect,

	children: source

}: {

	disabled?: boolean
	required?: boolean

	icon?: boolean | ReactNode
	menu?: ReactNode

	placeholder?: string

	/**
	 * The delay in ms before changes are auto-submitted after the last edit.
	 */
	auto?: number

	onSelect: (value: V) => void

	children: Matches<V>

}) {

	const [keywords, setKeywords]=useState("");
	const [offset, setOffset]=useState(0);
	const [limit, setLimit]=useState(AutoSize);

	const [options, setOptions]=useState<V[]>();


	function clear() {
		setKeywords("");
		setOptions(undefined);
	}

	function select(option: V) {

		onSelect(option);

		setKeywords("");
		setOptions(undefined);

	}

	return createElement("tool-auto", {

		onKeyDown: keys({

			"Escape": e => {

				clear();

				e.currentTarget.querySelector("input")?.focus();

			},

			"ArrowDown": e => {

				if ( e.target instanceof HTMLInputElement ) {

					const select=e.currentTarget.querySelector("select");

					if ( select ) {
						select.focus();
						select.selectedIndex=0;
					}

					return true;

				} else {

					return false;

				}

			}

		}),

		onBlur: e => {

			const memo={ ...e };

			setTimeout(() => {

				if ( !memo.currentTarget.contains(document.activeElement) ) { clear(); }

			});

		}

	}, <>

		<header>

			<input type={"text"} disabled={disabled} required={required}

				value={keywords}
				placeholder={placeholder}

				onInput={e => setKeywords(e.currentTarget.value)}

				onInputCapture={useTrailing(auto || AutoDelay,

					e => {

						const keywords=e.currentTarget.value.trim();

						if ( keywords.length >= AutoLength ) {
							source({ keywords, offset, limit }).then(setOptions);
						}

						setOptions(undefined);

					},

					[source]
				)}

			/>

			{keywords && <button title={"Clear"} onClick={e => {

				clear();

				focus(e.currentTarget.previousSibling);

			}}><ClearIcon/></button>}

		</header>

		{options !== undefined && <footer>{

			keywords && !options ? <ToolSpin/>
				: options?.length ? Select(options)
					: <small>No Matches</small>

		}</footer>}

	</>);


	function Select(options: V[]) {

		return <select

			size={Math.min(Math.max(2, options.length), AutoSize)} // ;( force scrollable list

			onClick={e => {

				select(options[e.currentTarget.selectedIndex]);

				focus(e.currentTarget.closest("tool-auto")?.querySelector("input"));

			}}

			onKeyDown={keys({

				"Enter": e => {

					select(options[e.currentTarget.selectedIndex]);

					focus(e.currentTarget.closest("tool-auto")?.querySelector("input"));

				}

			})}

		>{options.map((value, index) => {

			return <option key={index}>{toValueString(value)}</option>;

		})}</select>;
	}

}
