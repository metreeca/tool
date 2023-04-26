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

import { Value }                from "@metreeca/core/value";
import { useCache }             from "@metreeca/data/hooks/cache";
import { Stats }                from "@metreeca/data/models/stats";
import React, { createElement } from "react";
import "./count.css";


export function ToolCount<

	V extends Value

>({

	children: [stats]

}: {

	children: Stats

}) {

	const [{ filtered, count }={ filtered: false, count: undefined }]=useCache(stats);


	return createElement("tool-count", {}, <>

        <span>{
			count === undefined ? ""
				: count === 0 ? `no ${filtered ? "matches" : "items"}`
					: count === 1 ? `1 ${filtered ? "match" : "item"}`
						: `${count} ${filtered ? "matches" : "items"}`
		}</span>

	</>);

}

