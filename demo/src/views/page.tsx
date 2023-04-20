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

import { ToolPage } from "@metreeca/view/widgets/page";
import { ToolLogo } from "@metreeca/view/widgets/logo";
import * as React from "react";
import { ReactNode } from "react";
import { DND } from "@metreeca/demo/pages/dnd";
import { id, label } from "@metreeca/core/entry";
import { About } from "@metreeca/demo/pages/about";
import { Home } from "@metreeca/demo/pages/home";
import { ToolPane } from "@metreeca/view/widgets/pane";


export function DemoPage({

	tray,

	children

}: {

	tray?: ReactNode

	children: ReactNode

}) {

	return <ToolPage

		side={<ToolPane header={<a href={id(Home)}><ToolLogo/></a>}/>}

		tray={tray ?? <ToolPane header={<a href={id(About)}>{label(About)}</a>}>

            <a href={id(DND)}>{label(DND)}</a>

        </ToolPane>}

	>

		<ToolPane

			header={<span/>}

		>{

			children

		}</ToolPane>

	</ToolPage>;

}