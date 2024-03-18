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

import { isBoolean } from "@metreeca/core/boolean";
import { isEntry } from "@metreeca/core/entry";
import { toValueString, Value } from "@metreeca/core/value";
import { useCache } from "@metreeca/data/hooks/cache";
import { useTrailing } from "@metreeca/data/hooks/events";
import { Option, Options } from "@metreeca/data/models/options";
import { AutoDelay, classes } from "@metreeca/view";
import { Check, CheckSquare, ClearIcon, X } from "@metreeca/view/widgets/icon";
import { ToolLink } from "@metreeca/view/widgets/link";
import { ToolMore } from "@metreeca/view/widgets/more";
import { ToolSpin } from "@metreeca/view/widgets/spin";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { createElement, ReactNode, useEffect, useRef, useState } from "react";
import "./options.css";


export function ToolOptions<

	T extends Value,
	V extends Value

>({

	compact,
	placeholder,

	as,

	children: [options, setOptions]

}: {

	compact?: boolean
	placeholder?: string

	as?: (value: V) => ReactNode

	children: Options<V>

}) {

	const [{ ready, type, size, more, keywords, limit, items }]=useCache(options);

	const element=useRef<Element>(null);

	const [active, setActive]=useState(false);
	const [input, setInput]=useCache(keywords);

	const [delta]=useState(limit); // progressive loading window size set to initial limit


	const expanded=!compact || active;
	const selected=items && items.some(({ selected }) => selected);

	const matching=items && items.length > 0;
	const overflow=expanded && matching && size > 0 && delta > size;


	useEffect(() => {

		function focus(e: FocusEvent) {

			if ( element.current && e.target instanceof Node ) {
				activate(element.current.contains(e.target));
			}

		}

		window.addEventListener("focus", focus, true);

		return () => {
			window.removeEventListener("focus", focus, true);
		};

	});


	function activate(active: boolean) {
		if ( active ) {

			setActive(true);

		} else {

			setActive(false);
			setOptions({ keywords: "" });

		}
	}

	function search(keywords: string) {
		setOptions({ keywords });
	}

	function clear() {
		setOptions({ keywords: "" });
	}

	function select(item: { value: null | V, selected: boolean }) {
		setOptions({ selection: item, keywords: "" });
	}

	function reset() {
		setOptions();
	}

	function load() {
		setOptions({ limit: limit + delta });
	}


	return createElement("tool-options", {

		ref: element,
		class: classes({ focused: active, overflow }),

		onMouseLeave: e => {

			e.currentTarget.querySelector("section")?.scrollTo(0, 0);

		},

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

				{
					!ready ? <ToolSpin/>
						: keywords ? <button title={"Clear"} onClick={clear}><ClearIcon/></button>
							: selected ? <button title={"Reset"} onClick={reset}><ClearIcon/></button>
								: undefined
				}

				{compact && <button title={expanded ? "Collapse" : "Expand"} onClick={() => setActive(!active)}>{
					expanded ? <ChevronUp/> : <ChevronDown/>
				}</button>}

			</nav>

		</header>

		{!expanded && selected && <section>

            <ul>{items.filter(({ selected }) => selected).map(Option)}</ul>

        </section>}

		<section>{expanded && matching && <> {/* retain section to preserve computed height */}

            <ul ref={ul => {

				if ( limit && ul && !ul.parentElement!.style.height ) {
					ul.parentElement!.style.height=`${ul.getBoundingClientRect().height}px`;
				}

			}}>{items.filter(({ selected }) => expanded || selected).map(Option)}</ul>

			{more && <ToolMore onLoad={load}/>}

        </>}</section>

		{items && expanded && !matching && <small>No Matches</small>}

	</>);


	function Option({ selected, value, count }: Option<V>) {
		return <li key={value === null ? "" : type.write(value)} className={count > 0 ? "available" : "unavailable"}>

			<input type="checkbox" checked={selected}

				onChange={e => select({ value, selected: e.currentTarget.checked })}

			/>

			{
				value === null ? Label(null)
					: as ? <span>{as(value)}</span>
						: isBoolean(value) ? value ? <Check/> : <X/>
							: isEntry(value) ? <ToolLink>{value}</ToolLink>
								: Label(type.format(value))
			}

			<small>{toValueString(count)}</small>

		</li>;
	}


	function Label(label: null | string) {
		return label
			? <span>{label}</span>
			: <span className={"label"}>{label === null ? "blank" : "empty"}</span>;
	}

}