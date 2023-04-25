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

import { useCache }                  from "@metreeca/data/hooks/cache";
import { classes }                   from "@metreeca/view";
import { ChevronDown, ChevronRight } from "@metreeca/view/widgets/icon";
import * as React                    from "react";
import { createElement, ReactNode }  from "react";
import "./tree.css";

/**
 * Creates a tree node.
 *
 * @param expanded
 * @param label
 * @param children
 * @constructor
 */
export function ToolTree({

	expanded=false,

	label,

	children

}: {

	expanded?: boolean

	label: ReactNode

	children?: ReactNode

}) {

	const parent=children !== undefined;

	const [expanded_, setExpanded_]=useCache(parent && expanded);


	function toggle() {
		setExpanded_(!expanded_)
	}


	return createElement("tool-tree", {

		class: classes({ expanded: expanded_ })

	}, <>

		<header>

			<button disabled={!parent} title={expanded_ ? "Collapse" : "Expand"}

				onClick={toggle}

			>{

				expanded_ ? <ChevronDown/> : <ChevronRight/>

			}</button>

			<span>{label}</span>

		</header>

		{children && expanded_ && <section>{children}</section>}

	</>);
}