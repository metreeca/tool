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

import { isDefined } from "@metreeca/core";
import { asOrder, Entry, Frame, id, isEntry, label, Order } from "@metreeca/core/entry";
import { isNumber } from "@metreeca/core/number";
import { isString } from "@metreeca/core/string";
import { equals, model } from "@metreeca/core/value";
import { useRoute } from "@metreeca/data/contexts/router";
import { useCache } from "@metreeca/data/hooks/cache";
import { Collection } from "@metreeca/data/models/collection";
import { Selection, SelectionDelta } from "@metreeca/data/models/selection";
import { classes } from "@metreeca/view";
import { DecreasingIcon, IncreasingIcon, OpenIcon, SortIcon } from "@metreeca/view/widgets/icon";
import { ToolMore } from "@metreeca/view/widgets/more";
import React, { createElement, ReactNode, useState } from "react";
import "./table.css";


// see com.metreeca.link.Stash.java

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

export function ToolTable<V extends Frame>({

	placeholder,

	sorted,
	fields,

	selection: [selection, setSelection]=[[], () => {}],
	children: [collection, setCollection]

}: {

	placeholder?: ReactNode

	sorted?: string | Order
	fields?: { [expression: string]: (item: V) => ReactNode }

	selection?: Selection<V>
	children: Collection<V>

}) {

	const cols: {

		[expression: string]: {

			entry: boolean
			number: boolean

			label: ReactNode,

			renderer: (item: V) => ReactNode

		}

	}=Object.entries(fields ?? {}).reduce((cols, [field, renderer]) => { // !!! default specs

		const { alias, expression }=parse(field);

		const value=model(collection.model, expression);

		return {

			...cols, [expression]: {

				entry: isEntry(value),
				number: isNumber(value),

				label: alias ?? expression,

				renderer

			}

		};

	}, {});

	const [expression, { entry }]=Object.entries(cols)[0] ?? [undefined, {}]; // first field


	const [, setRoute]=useRoute();

	const [order, setOrder]=useState<Order>(asOrder(collection.query["^"]) ??
		isString(sorted) ? { [sorted as string]: "increasing" }
			: isDefined(sorted) ? sorted
				: expression ? { [entry ? `${expression}.label` : expression]: "increasing" }
					: isEntry(collection.model) ? { label: "increasing" }
						: {}
	);

	const [offset, setOffset]=useState(0); // !!! sliding window (beware of interaction with selection)
	const [limit, setLimit]=useState(25);

	const [items]=useCache(collection.items({

		...collection.model,
		...collection.query,

		"^": order,
		"@": offset,
		"#": limit+1

	}));

	const more=items && items.length > limit;


	function select(value: SelectionDelta<V>): void {
		setSelection(value);
	}

	function open({ id }: Entry): void {
		setRoute(id);
	}

	function sort(expression: string): void {
		setOrder({ [expression]: order[expression] === "increasing" ? "decreasing" : "increasing" });
	}

	function load() {
		setLimit(limit+10);
	}


	return createElement("tool-table", {}, !items?.length ? <small>{placeholder}</small> : <>

			<table

				style={{

					gridTemplateColumns: selection
						? `min-content repeat(${Object.keys(cols).length}, min-content) 1fr`
						: `repeat(${Object.keys(cols).length}, min-content) 1fr`

				}}

			>

				<thead>

					<tr>

						{selection && <th>

                            <input type={"checkbox"}

                                checked={selection.length > 0}

                                onChange={e => select(e.target.checked ? items ?? [] : [])}

                            />

                        </th>}

						{Object.entries(cols).map(([expression, { number, label }]) =>

							<th key={expression} className={classes({ right: number })}>

								<button onClick={e => sort(expression)}>

									{label}

									{order[expression] === "increasing" ? <IncreasingIcon/>
										: order[expression] === "decreasing" ? <DecreasingIcon/>
											: <SortIcon stroke={"transparent"}/> // keep spacing stable
									}

								</button>

							</th>
						)}

						<th/>

					</tr>

				</thead>

				<tbody>{items?.map(item => <tr key={isEntry(item) ? id(item) : JSON.stringify(item)}>

					{selection && <td>

                        <input type={"checkbox"}

                            checked={selection.some(selected => equals(selected, item))}

                            onChange={e => {
								select({ value: item, selected: e.currentTarget.checked });
							}}

                        />

                    </td>}

					{Object.entries(cols).map(([expression, { number, renderer }]) =>

						<td key={expression} className={classes({ right: number })}>

							{renderer(item)}

						</td>
					)}

					<td>{isEntry(item) && <button title={`Open '${label(item)}'`}

                        onClick={() => open(item)}

                    >

                        <OpenIcon/>

                    </button>}</td>

				</tr>)}</tbody>

			</table>

			{more && <ToolMore onLoad={load}/>}

		</>
	);

}


