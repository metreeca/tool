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

import { isBoolean } from "@metreeca/core/boolean";
import { isEntry } from "@metreeca/core/entry";
import { toValueString, Value } from "@metreeca/core/value";
import { useCache } from "@metreeca/data/hooks/cache";
import { useTrailing } from "@metreeca/data/hooks/events";
import { Option, Options } from "@metreeca/data/models/options";
import { AutoDelay, classes } from "@metreeca/view";
import { Check, CheckSquare, ChevronsLeft, ClearIcon, X } from "@metreeca/view/widgets/icon";
import { ToolLink } from "@metreeca/view/widgets/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { createElement, useEffect, useRef, useState } from "react";
import "./options.css";


export function ToolOptions<

	T extends Value,
	V extends Value

>({

	compact,
	placeholder,

	children: [options, setOptions]

}: {

	compact?: boolean
	placeholder?: string

	// !!! option renderer

	children: Options<V>

}) {

	const [{ type, more, keywords, offset, limit, items }]=useCache(options);


	const element=useRef<Element>(null);

	const [focused, setFocused]=useState(false);
	const [input, setInput]=useCache(keywords);


	useEffect(() => {

		const focus=(e: FocusEvent) => {
			return activate(
				e.target instanceof Node && (element.current?.contains(e.target) || false) && (
					focused || e.target instanceof HTMLInputElement && e.target.parentElement?.tagName === "HEADER"
				)
			);
		};

		window.addEventListener("focus", focus, true);

		return () => {
			window.removeEventListener("focus", focus, true);
		};

	});


	function activate(activate: boolean) {
		if ( activate ) {

			setFocused(true);

		} else {

			setFocused(false);
			setOptions({ keywords: "" });

		}
	}

	function search(keywords: string) {
		setOptions({ keywords });
	}

	function clear() {
		setOptions({ keywords: "" });
	}

	function scroll(delta: number) {
		if ( delta !== 0 ) {setOptions({ offset: Math.max(0, offset+delta*limit) }); }
	}

	function select(item: { value: null | V, selected: boolean }) {
		setOptions({ selection: item, keywords: "" });
	}

	function reset() {
		setOptions();
	}


	const expanded=!compact || focused;
	const paging=more || offset > 0;

	const selected=items?.some(({ selected }) => selected);

	return createElement("tool-options", {

		ref: element,
		class: classes({ focused }),

		onKeyDown: e => {
			if ( e.key === "Escape" || e.key === "Enter" ) {

				e.preventDefault();

				if ( document.activeElement instanceof HTMLElement ) {
					document.activeElement.blur();
				}

				activate(false);
			}
		}

	}, <>

		<header>

			<i><CheckSquare/></i>

			<input type={"text"}

				value={input}
				placeholder={placeholder}

				onFocus={e => e.currentTarget.select()}
				onInput={e => setInput(e.currentTarget.value)}

				onInputCapture={useTrailing(AutoDelay, e => {

					search(e.currentTarget.value.trim());

				}, [options])}

			/>

			<nav>

				{expanded && paging && <>

                    <button type={"button"} title={"First Page"}
                        disabled={offset === 0} onClick={() => scroll(0)}
                    ><ChevronsLeft/></button>

                    <button type={"button"} title={"Previous Page"}
                        disabled={offset === 0} onClick={() => scroll(-1)}
                    ><ChevronLeft/></button>

                    <button type={"button"} title={"Next Page"}
                        disabled={!more} onClick={() => scroll(+1)} // !!! disabled
                    ><ChevronRight/></button>

                </>}

				{keywords ? <button title={"Clear"} onClick={clear}><ClearIcon/></button>
					: selected ? <button title={"Reset"} onClick={reset}><ClearIcon/></button>
						: null}

			</nav>

		</header>

		<section>

			{
				items === undefined ? undefined
					: items.length ? items.filter(({ selected }) => expanded || selected).map(Option)
						: expanded && <small>No Matches</small>
			}

			{/*<ToolLoad more={more} onLoad={() => { setOptions({ offset: offset+1 });}}/>*/}

		</section>

	</>);


	function Option({ selected, value, count }: Option<V>) {
		return <div key={value === null ? "" : type.write(value)} className={count > 0 ? "available" : "unavailable"}>

			<input type="checkbox" checked={selected} disabled={!selected && count === 0}

				onChange={e => select({ value, selected: e.currentTarget.checked })}

			/>

			{
				isBoolean(value) ? value ? <Check/> : <X/>
					: isEntry(value) ? <ToolLink>{value}</ToolLink>
						: <span>{value === null ? "‹blank›" : type.format(value)}</span>
			}

			<small>{toValueString(count)}</small>

		</div>;
	}

}