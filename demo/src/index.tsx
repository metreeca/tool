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

import "@metreeca/view/styles/roboto.css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ToolContext } from "@metreeca/data/contexts/context";
import { ToolRouter } from "@metreeca/data/contexts/router";
import { id } from "@metreeca/core/entry";
import { DemoHome, Home } from "@metreeca/demo/pages/home";
import { DemoDND, DND } from "@metreeca/demo/pages/dnd";
import { About, DemoAbout } from "@metreeca/demo/pages/about";


createRoot(document.body.firstElementChild!).render((

	<React.StrictMode>

		<ToolContext>

			<ToolRouter>{{

				[id(Home)]: DemoHome,
				[id(About)]: DemoAbout,

				[id(DND)]: DemoDND,

				"*": id(Home)

			}}</ToolRouter>

		</ToolContext>

	</React.StrictMode>

));

