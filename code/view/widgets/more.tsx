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

import { ToolSpin }                                           from "@metreeca/view/widgets/spin";
import React, { createElement, ReactNode, useEffect, useRef } from "react";
import "./more.css";


/**
 * Creates an incremental loading trigger.
 *
 * @param onLoad
 * @param children
 * @constructor
 */
export function ToolMore({

	onLoad,

	children


}: {

	onLoad: () => void

	children?: ReactNode

}) {

	const loader=useRef<HTMLElement>(null);


	useEffect(() => {

		const current=loader.current;

		if ( current ) {

			const observer=new IntersectionObserver(entries => entries.forEach(entry => {

				if ( entry.isIntersecting ) { onLoad(); }

			}), {

				root: null,
				threshold: 0.1

			});

			observer.observe(current);

			return () => observer.unobserve(current);

		} else {

			return () => {};

		}

	}, [onLoad]);


	return createElement("tool-more", { ref: loader }, children ?? <ToolSpin/>);

}