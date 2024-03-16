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

import { isDefined } from "@metreeca/core";
import { Entry, isEntry, toEntryString } from "@metreeca/core/entry";
import { Frame, isFrame } from "@metreeca/core/frame";
import { isNumber } from "@metreeca/core/number";
import { isString } from "@metreeca/core/string";
import { equals, evaluate } from "@metreeca/core/value";
import { useRouter } from "@metreeca/data/contexts/router";
import { useCache } from "@metreeca/data/hooks/cache";
import { Collection } from "@metreeca/data/models/collection";
import { Selection, SelectionDelta } from "@metreeca/data/models/selection";
import { asCriterion, asSort, Order } from "@metreeca/link";
import { classes } from "@metreeca/view";
import { ToolHint } from "@metreeca/view/widgets/hint";
import { DecreasingIcon, IncreasingIcon, OpenIcon, SortIcon } from "@metreeca/view/widgets/icon";
import { ToolMore } from "@metreeca/view/widgets/more";
import { ChevronsUpDown } from "lucide-react";
import React, { createElement, ReactNode, useEffect, useState } from "react";
import "./table.css";


const LimitInit=25;
const LimitNext=10;


const IdPattern="\\w+";
const LabelPattern="(?:[^'\\\\]|\\.)*";
const FieldPattern=`^(?:(?:(?<id>${IdPattern})|'(?<label>${LabelPattern})')=)?(?<expression>.*)$`;

function parse(expression: string): {

	alias?: string
	expression: string

} {

	const matches=expression.match(FieldPattern);

	if ( !matches ) {
		throw new RangeError(`malformed expression <${expression}>`);
	}

	return {

		alias: matches.groups?.id ?? matches.groups?.label,
		expression: matches.groups?.expression ?? ""

	};

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const DummySelector=() => {};


export function ToolTable<V extends Frame>({

	hierarchy,
	placeholder,

	sorted,
	fields,

	selection: [selection, setSelection]=[[], DummySelector],
	children: [collection, setCollection]

}: {

	hierarchy?: boolean
	placeholder?: ReactNode

	sorted?: string | Order
	fields?: { [expression: string]: (item: V) => ReactNode }

	selection?: Selection<V>
	children: Collection<V>

}) {

	const selectable=(setSelection !== DummySelector);

	const cols: {

		[expression: string]: {

			numeric: boolean

			label: ReactNode,

			renderer: (item: V) => ReactNode

		}

	}=Object.entries(fields ?? {}).reduce((cols, [field, renderer]) => { // !!! default specs

		const { alias, expression }=parse(field);

		const value=evaluate(collection.model, expression);

		return {

			...cols, [expression]: {

				number: isNumber(value),

				label: alias ?? expression,

				renderer

			}

		};

	}, {});


	const first=Object.keys(cols)[0];

	const [, setRoute]=useRouter();
	const [widths, setWidths]=useState(""); // frozen column widths

	const initialOrder: Order=
		isString(sorted) ? { [sorted]: "increasing" }
			: isDefined(sorted) ? sorted
				: first ? { [first]: "increasing" }
					: isFrame(collection.model) ? { "label": "increasing" }
						: {};

	const [order, setOrder]=useState(initialOrder);

	const [offset, setOffset]=useState(0); // !!! sliding window (beware of interaction with selection)
	const [limit, setLimit]=useState(LimitInit);

	const [items]=useCache(collection.items({

		...collection.model,
		...collection.query,

		...(Object.entries(order).reduce((value, [expression, criterion]) => ({

			...value, [asSort(expression, collection.model)]: asCriterion(criterion)

		}), {})),

		"@": offset,
		"#": limit + 1

	}));

	const more=items && items.length > limit;


	useEffect(() => {

		function resize() { setWidths(""); }

		window.addEventListener("resize", resize);

		return () => { window.removeEventListener("resize", resize); };

	}, []);


	function select(value: SelectionDelta<V>): void {
		setSelection(value);
	}

	function open({ id }: Entry): void {
		setRoute(id);
	}

	function sort(expression: string): void {
		setOrder({ [expression]: order[expression] === "increasing" ? "decreasing" : "increasing" });
	}

	function reset() {
		setOrder(initialOrder);
	}

	function load() {
		setLimit(limit + LimitNext);
	}


	return items?.length ? createElement("tool-table", {}, <>

		<table ref={table => { // freeze column widths to avoid accordion effects on resorting

			if ( table ) {
				setWidths(Array.from(table.querySelectorAll("thead > tr > th"))
					.map(th => `${th.getBoundingClientRect().width}px`)
					.join(" ")
				);
			}

		}}

			style={{

				gridTemplateColumns: widths || `min-content repeat(${Object.keys(cols).length}, min-content) 1fr`

			}}

		>

			<thead>

			<tr>

				<th className={"scroll-y"}>

					{selectable && <input type={"checkbox"}

                        checked={selection.length > 0}

                        onChange={e => select(e.target.checked ? items ?? [] : [])}

                    />}

				</th>

				{Object.entries(cols).map(([expression, { numeric, label }]) =>

					<th key={expression} className={classes({

						"scroll-y": true,

						right: numeric

					})}>

						<button onClick={() => sort(expression)}>

							<span>{label}</span>

							{order[expression] === "increasing" ? <IncreasingIcon/>
								: order[expression] === "decreasing" ? <DecreasingIcon/>
									: <SortIcon stroke={"transparent"}/> // keep spacing stable
							}

						</button>

					</th>
				)}

				<th className={"scroll-y"}>
					<button onClick={reset}><ChevronsUpDown/></button>
				</th>

			</tr>

			</thead>

			<tbody>{items?.map((item, index) => {

				const skip=head(item, index ? items[index - 1] : {} as Frame);


				function head(x: Frame, y: Frame): number { // returns the length of the initial shared row head

					let n=0;

					for (const k in cols) {
						if ( equals(x[k], y[k]) ) { ++n; } else { return n; }
					}

					return n;

				}


				return <tr key={isEntry(item) ? item.id : JSON.stringify(item)}>

					<td className={"scroll-r"}>

						{selectable && <input type={"checkbox"}

                            checked={selection.some(selected => equals(selected, item))}

                            onChange={e => {
								select({ value: item, selected: e.currentTarget.checked });
							}}

                        />}

					</td>

					{Object.entries(cols).map(([expression, { numeric, renderer }], index) =>

						<td key={expression} className={classes({
							right: numeric,
							placeholder: hierarchy && index < skip
						})}>

							{renderer(item)}

						</td>
					)}

					<td>{isEntry(item) && <button title={`Open '${toEntryString(item)}'`}

                        onClick={() => open(item)}

                    >

                        <OpenIcon/>

                    </button>}</td>

				</tr>;

			})}</tbody>

		</table>

		{more && <ToolMore onLoad={load}/>}

	</>) : placeholder ? <ToolHint>{placeholder}</ToolHint> : null;

}


