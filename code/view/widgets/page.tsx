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

import { useFetcher }                                           from "@metreeca/data/contexts/fetcher";
import { classes }                                              from "@metreeca/view";
import { ToolSpin }                                             from "@metreeca/view/widgets/spin";
import React, { createElement, ReactNode, useEffect, useState } from "react";
import "./page.css";


export function ToolPage({

	locked=false,

	side="20rem",

	logo,
	tray,

	done,
	back,

	name,
	menu,

	pane,
	info,
	copy,

	children

}: {

	locked?: boolean

	side?: string // side area preferred width

	logo?: ReactNode
	tray?: ReactNode

	done?: ReactNode
	back?: ReactNode

	name?: ReactNode
	menu?: ReactNode

	pane?: ReactNode
	info?: ReactNode
	copy?: ReactNode

	children: ReactNode

}) {

	const fetcher=useFetcher();

	const [active, setActive]=useState(false);
	const [expanded, setExpanded]=useState<boolean>();


	useEffect(() => {

		return fetcher.observe(setActive);

	}, [fetcher]);

	useEffect(() => {

		function resize() { setExpanded(undefined); }

		window.addEventListener("resize", resize);

		return () => window.removeEventListener("resize", resize);

	});

	return createElement("tool-page", {

		class: classes({

			locked,
			active

		}),

		style: {

			"--tool-page-side-width": side

		}

		// onClick: e => {
		//
		//     if ( tray ) { setTray(!(e.target === e.currentTarget || (e.target as Element).closest("a"))); }
		//
		// },

		// onKeyDown: (e) => {
		//     if ( e && e.key === "Enter" ) {
		//         e.cancelable=true;
		//         if ( e.stopPropagation ) {
		//             e.stopPropagation();
		//             e.preventDefault();
		//         }
		//     }
		// }

	}, <>

		<aside>

			<header>
				{logo && <span>{logo}</span>}
				{tray && <span>{tray}</span>}
			</header>

			<section>{pane}</section>
			<footer>{info}</footer>

		</aside>

		<main>

			<header>
				{done ? <span>{done}</span> : name ? <span>{name}</span> : undefined}
				{active ? <ToolSpin/> : back ? <span>{back}</span> : menu ? <span>{menu}</span> : undefined}
			</header>

			<section>{children}</section>
			<footer>{copy}</footer>

		</main>

	</>);
}
