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

import { id } from "@metreeca/core/entry";
import { Home } from "@metreeca/demo/pages/home";
import { ToolPage } from "@metreeca/view/layouts/page";
import { ToolLogo } from "@metreeca/view/widgets/logo";
import { Path, ToolPath } from "@metreeca/view/widgets/path";
import * as React from "react";
import { ReactNode } from "react";


export function DemoPage({

	name,
	menu,

	tray,

	children

}: {

	name?: Path
	menu?: ReactNode

	tray?: ReactNode

	children: ReactNode

}) {

	return <ToolPage

		logo={<a href={id(Home)}><ToolLogo/></a>}
		meta={NAME}

		name={<ToolPath>{name}</ToolPath>}
		menu={menu}

		tray={tray}

	>{

		children

	}</ToolPage>;

}