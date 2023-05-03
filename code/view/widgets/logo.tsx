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

import { app } from "@metreeca/view";
import * as React from "react";
import { createElement } from "react";
import "./logo.css";


/**
 * Creates a component displaying the app {@link icon}.
 *
 * @constructor
 */
export function ToolLogo() {

	return createElement("tool-logo", {

		title: app.name,

		style: { backgroundImage: `url(${(app.icon)})` }

	});

}

