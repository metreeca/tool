/*
 * Copyright © 2020-2024 Metreeca srl
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

import { isArray, isDefined } from "@metreeca/core";
import { isEntry } from "@metreeca/core/entry";
import { isValue, toValueString, Value } from "@metreeca/core/value";
import { ToolLink } from "@metreeca/view/widgets/link";
import * as React from "react";
import { createElement, ReactNode } from "react";
import "./path.css";


export type Path=undefined | Value | ReactNode | Array<undefined | Value | ReactNode>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a breadcrumbs path component.
 */
export function ToolPath({

	children: path

}: {

	children: Path

}) {

	const steps=isArray<undefined | Value | ReactNode>(path) ? path : [path];

	return createElement("tool-path", {}, steps.map((step, index) =>
		isEntry(step) && index + 1 < steps.length ? <ToolLink key={step.id}>{step}</ToolLink>
			: isValue(step) ? <span key={toValueString(step)}>{toValueString(step)}</span>
				: isDefined(step) ? <React.Fragment key={index}>{step}</React.Fragment>
					: undefined
	));

}
