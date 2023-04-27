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


import { useTrailing }                               from "@metreeca/data/hooks/events";
import { AutoDelay, AutoLength, AutoSize, keys }     from "@metreeca/view";
import { createPlaceholder }                         from "@metreeca/view/fields";
import "@metreeca/view/fields/index.css";
import { focus, input }                              from "@metreeca/view/widgets/form";
import { ClearIcon }                                 from "@metreeca/view/widgets/icon";
import { ToolSpin }                                  from "@metreeca/view/widgets/spin";
import React, { createElement, ReactNode, useState } from "react";
import "./auto.css";


export type Source=(keywords: string) => Promise<undefined | null | Option[]>

export type Option={ value: string, label: string }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
export function ToolAuto<V>({

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

	onSelect: (option: Option) => void

	children: Source

}) {

	const [keywords, setKeywords]=useState("");
	const [options, setOptions]=useState<Awaited<ReturnType<typeof source>> | ReturnType<typeof source>>();


	function doClear() {
		setKeywords("");
		setOptions(undefined);
	}

	function doSelect(option: undefined | Option) {

		if ( option ) { onSelect(option); }

		doClear();

	}

	return createElement("tool-auto", {

		onKeyDown: keys({

			"Escape": e => {

				doClear();

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

				if ( !memo.currentTarget.contains(document.activeElement) ) { doClear(); }

			});

		}

	}, <>

		<header>

			<input type={"text"} disabled={disabled} required={required}

				value={keywords}
				placeholder={placeholder}

				onInput={e => setKeywords(e.currentTarget.value)}

				onInputCapture={useTrailing(auto || AutoDelay,

					e => setOptions(e.currentTarget.value.length < AutoLength

						? undefined

						: source(e.currentTarget.value).then(options => {

							setOptions(options);

							return options;

						})
					),

					[source, setOptions]
				)}

			/>

			{(keywords || options) && <button title={"Clear"} onClick={e => {

				doClear();
				focus(e.currentTarget.previousSibling);

			}}><ClearIcon/></button>}

		</header>

		{options !== undefined && <footer>{

			options instanceof Promise ? <ToolSpin/>
				: options === null ? createPlaceholder("No Matches")
					: Select(options)

		}</footer>}

	</>);


	function Select(options: Option[]) {

		return <select

			size={Math.min(Math.max(2, options.length), AutoSize)} // ;( force scrollable list

			onClick={e => { doSelect(options[e.currentTarget.selectedIndex]); }}

			onKeyDown={keys({

				"Enter": e => doSelect(options[e.currentTarget.selectedIndex])

			})}

		>{options.map(({ value, label }) => {

			return <option key={value} value={value}>{label}</option>;

		})}</select>;
	}

}
