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

import { isString }                           from "@metreeca/core/string";
import { classes }                            from "@metreeca/view";
import * as React                             from "react";
import { createElement, ReactNode, useState } from "react";
import "./card.css";


/**
 * Resource summary card.
 *
 * @param wrap
 * @param size
 * @param title
 * @param tags
 * @param image
 * @param children
 * @constructor
 */
export function ToolCard({

	wrap,
	size = "10rem",
	side = "start",

	tags,
	title,
	image,

	children

}: {

	wrap?: boolean
	size?: string
	side?: "start" | "end"

	tags?: ReactNode
	title?: ReactNode
	image?: ReactNode

	children?: ReactNode

}) {

	const [loaded, setLoaded] = useState(false);

	return createElement("tool-card", {

		class: classes({ start: side === "start", end: side === "end" }),
		style: { "--tool-card-size": size }

	}, <>

		{(title || tags) && <header>

            <nav>{tags}</nav>

            <h1>{title}</h1>

        </header>}

		<section>

			{isString(image) ? <img hidden={!loaded} src={image}

				onLoad={() => setLoaded(true)}

			/> : image}

			<div className={classes({ wrap })}>{children}</div>

		</section>

	</>);

}