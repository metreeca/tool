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

import { Value }      from "@metreeca/core/value";
import { Collection } from "@metreeca/data/models/collection";
import { ClearIcon }  from "@metreeca/view/widgets/icon";
import React          from "react";

export function ToolClear<

	V extends Value

>({

	children: [{ filtered }, setCollection]

}: {

	children: Collection<V>

}) {

	function reset() {
		setCollection();
	}

	return <button title={"Clear Filters"} disabled={!filtered} onClick={reset}><ClearIcon/></button>;

}