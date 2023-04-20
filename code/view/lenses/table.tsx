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

import { asOrder, Entry, Frame, isEntry, label, Order } from "@metreeca/core/entry";
import { isNumber } from "@metreeca/core/number";
import { equals, model } from "@metreeca/core/value";
import { useRoute } from "@metreeca/data/contexts/router";
import { useCache } from "@metreeca/data/hooks/cache";
import { Collection } from "@metreeca/data/models/collection";
import { Selection, SelectionDelta } from "@metreeca/data/models/selection";
import { classes } from "@metreeca/view";
import { DecreasingIcon, IncreasingIcon, OpenIcon, SortIcon } from "@metreeca/view/widgets/icon";
import { ToolLoad } from "@metreeca/view/widgets/load";
import React, { createElement, ReactNode, useState } from "react";
import "./table.css";


export type ToolTableRow=Readonly<{

	[expression: string]: ReactNode | {
		label?: ReactNode,
		value: ReactNode
	}

}>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolTable<V extends Frame>({

	placeholder,

	selection: [selection, setSelection]=[[], () => {}],

	children: [collection, setCollection, custom]

}: {

	placeholder?: ReactNode

	selection?: Selection<V>

	children: Collection<V, ToolTableRow>

}) {

	const renderer=custom ?? (() => ({})); // !!! default renderer


	let [, setRoute]=useRoute();


	const [order, setOrder]=useState<Order>(asOrder(collection.query["^"]) ?? isEntry(collection.model) ? { label: "increasing" } : {});
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

	const rows: undefined | Array<[V, {

		[expression: string]: {
			label: ReactNode,
			value: ReactNode
		}

	}]>=items?.map(value => [value, Object.entries(renderer(value)).reduce((row, [expression, cell]) => ({

		...row,

		[expression]: {
			label: (cell as any)?.label ?? expression,
			value: (cell as any)?.value ?? cell
		}

	}), {})]);

	const cols: {

		[expression: string]: ReactNode

	}=Object.entries(rows?.[0]?.[1] ?? {}).reduce((cols, [expression, { label }]) => ({

		...cols,

		[expression]: label

	}), {});


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

						{Object.entries(cols).map(([expression, label]) =>

							<th key={expression}
								className={classes({ right: isNumber(model(collection.model, expression)) })}
							>

								<button onClick={e => {

									sort(expression);
									e.currentTarget.blur();

								}}>

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

				<tbody>{rows?.map(([value, cells], index) => <tr key={index}>

					{selection && <td>

                        <input type={"checkbox"}

                            checked={selection.some(selected => equals(selected, value))}

                            onChange={e => {
								select({ value, selected: e.currentTarget.checked });
							}}

                        />

                    </td>}

					{Object.entries(cells).map(([expression, { value }]) =>

						<td key={expression}
							className={classes({ right: isNumber(model(collection.model, expression)) })}
						>

							{value}

						</td>
					)}

					<td>{isEntry(value) && <button title={`Open '${label(value)}'`}

                        onClick={() => open(value)}

                    >

                        <OpenIcon/>

                    </button>}</td>

				</tr>)}</tbody>

			</table>

			<ToolLoad more={more} onLoad={load}/>

		</>
	);

}


