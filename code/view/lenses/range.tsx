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

import { isDefined, Type } from "@metreeca/core";
import { date } from "@metreeca/core/date";
import { dateTime } from "@metreeca/core/dateTime";
import { decimal } from "@metreeca/core/decimal";
import { integer } from "@metreeca/core/integer";
import { string } from "@metreeca/core/string";
import { time } from "@metreeca/core/time";
import { Value } from "@metreeca/core/value";
import { year } from "@metreeca/core/year";
import { useCache } from "@metreeca/data/hooks/cache";
import { useTrailing } from "@metreeca/data/hooks/events";
import { Range } from "@metreeca/data/models/range";
import { AutoDelay, classes } from "@metreeca/view";
import { Calendar, ClearIcon, Clock, Hash, TypeIcon } from "@metreeca/view/widgets/icon";
import * as React from "react";
import { ChangeEvent, createElement, FocusEvent as FocusingEvent, useEffect, useRef, useState } from "react";
import "./range.css";


const WideTypes=new Set<Type>([date, dateTime]);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolRange<

	T extends Value,
	V extends Value

>({

	compact,
	placeholder,

	children: [{ type, min, max, gte, lte }, setRange]

}: {

	compact?: boolean
	placeholder?: string

	children: Range<V>

}) {

	const element=useRef<Element>(null);
	const [focused, setFocused]=useState(false);


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
		setFocused(active);
	}

	function lower(gte: null | V) {
		setRange({ gte });
	}

	function upper(lte: null | V) {
		setRange({ lte });
	}

	function reset() {
		setRange();
	}


	const selected=gte !== undefined || lte !== undefined;
	const expanded=!compact || focused || selected;


	return createElement("tool-range", {

		ref: element,
		class: classes({ focused }),

		onFocus: e => {

			if ( e.currentTarget.querySelector("header > input") === e.target ) {
				(e.currentTarget.querySelector("section > input") as HTMLElement)?.focus();
			}

		},

		onKeyDown: e => {
			if ( e.key === "Escape" || e.key === "Enter" ) {

				e.preventDefault();

				if ( document.activeElement instanceof HTMLElement ) {
					document.activeElement.blur();
				}

				setFocused(false);

			}
		}

	}, <>

		<header>

			<i><Icon type={type}/></i>

			<input readOnly placeholder={placeholder}/>

			<nav>{selected && <button title={"Reset"} onClick={reset}><ClearIcon/></button>}</nav>

		</header>

		{expanded && <section className={classes({ wide: WideTypes.has(type) })}>

            <Input type={type} max={lte} placeholder={min}>{[gte, lower]}</Input>
            <Input type={type} min={gte} placeholder={max}>{[lte, upper]}</Input>

        </section>}

	</>);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Icon({

	type

}: {

	type: Type

}) {

	switch ( type ) {

		case integer:
		case decimal:

			return <Hash/>;

		case string:

			return <TypeIcon/>;

		case year:
		case date:
		case dateTime:

			return <Calendar/>;

		case time:

			return <Clock/>;

		default:

			return null;

	}

}

function Input<V>({

	type,

	min,
	max,
	placeholder,

	children: [value, setValue]

}: {

	type: Type

	min?: undefined | V
	max?: undefined | V
	placeholder: undefined | V

	children: [undefined | V, (value: null | V) => void]

}) {

	const [focused, setFocused]=useState(false);
	const [input, setInput]=useCache(value === undefined ? "" : type.write(value));

	const common={

		min: isDefined(min) ? type.write(min) : undefined,
		max: isDefined(max) ? type.write(max) : undefined,

		value: input,
		placeholder: isDefined(placeholder) ? type.format(placeholder) : "",

		onFocus: (e: FocusingEvent<HTMLInputElement>) => {

			setFocused(true);
			e.target.select();

		},

		onInput: (e: ChangeEvent<HTMLInputElement>) => {

			setInput(e.currentTarget.value);

		},

		onInputCapture: useTrailing<ChangeEvent<HTMLInputElement>>(AutoDelay, e => {

			const value=e.target.value.trim();

			if ( e.target.checkValidity() ) {
				setValue(value ? type.parse(value) : null);
			}

		}, [setValue])

	};

	switch ( type ) {

		case integer:

			return <input type={"number"} pattern={"[-+]?\d*"} {...common}/>;

		case decimal:

			return <input type={"number"} {...common}/>;

		case year:

			return <input type={"string"} pattern={"\d{4}"}{...common}/>;

		case date:

			return <input type={focused || value ? "date" : "text"} {...common}

				onBlur={e => {

					setFocused(false);

					// ;(chrome) no change event on clear

					const current=type.parse(e.target.value.trim());

					if ( e.target.checkValidity() && current !== value ) {
						setValue(current);
					}

				}}

			/>;

		default:

			throw `unsupported range type <${type.label}>`;

	}

}