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
 * @param name
 * @param tags
 * @param icon
 * @param children
 * @constructor
 */
export function ToolCard({

	wrap,
	size = "10rem",

	name,
	tags,
	icon,

	children

}: {

	wrap?: boolean
	size?: string

	name?: ReactNode
	tags?: ReactNode
	icon?: ReactNode

	children?: ReactNode

}) {

	const [loaded, setLoaded] = useState(false);

	return createElement("tool-card", {

		style: { "--tool-card-size": size }

	}, <>

		{(name || tags) && <header>

            <nav>{tags}</nav>

            <h1>{name}</h1>

        </header>}

		<section>

			{isString(icon) ? <img hidden={!loaded} src={icon}

				onLoad={() => setLoaded(true)}

			/> : icon}

			<div className={classes({ wrap })}>{children}</div>

		</section>

	</>);

}
