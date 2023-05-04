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

import { isDefined } from "@metreeca/core";
import { Frame, isFrame, toFrameString } from "@metreeca/core/entry";
import { Resource } from "@metreeca/data/models/resource";
import { ToolHint } from "@metreeca/view/widgets/hint";
import React, { ReactNode } from "react";

export function ToolFrame<V extends Frame>({

	placeholder,

	as=toFrameString,

	children: state

}: {

	placeholder?: ReactNode

	as?: (resource: V) => ReactNode

	children: undefined | V | Resource<V>

}) {

	const resource=isFrame(state) ? state : isDefined(state) ? state[0] : undefined;

	return <>{

		resource ? as(resource)
			: placeholder ? <ToolHint>{placeholder}</ToolHint>
				: null

	}</>;

}