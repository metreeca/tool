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

import { isEmpty } from "@metreeca/core";

import { Trace } from "@metreeca/link";
import { classes } from "@metreeca/view";
import { AlertTriangle, Frown, Ghost, HelpCircle, Info, Lock } from "@metreeca/view/widgets/icon";
import * as React from "react";
import { createElement, ReactNode } from "react";
import "./note.css";


export function unexpected({ status, reason, detail }: Trace, report?: ReactNode) {
	return <ToolNote warning icon={

		status === 403 ? <Lock/>
			: status === 404 ? <Frown/>
				: status === 410 ? <Ghost/>
					: null

	}>

		<div>{
			status === 403 ? "You're not authorized\nto access this resource"
				: status === 404 ? "The resource you're\nlooking for is missing"
					: status === 410 ? "The resource you're\nlooking for is gone"
						: `Unexpected Error ${status}\n${reason}`
		}</div>

		{status >= 400 && ![403, 404, 410].includes(status) && <>

            <div>{report ?? "Please report. Thanks!"}

            </div>

			{detail && <code>{

				isEmpty(detail) ? undefined
					: JSON.stringify(detail, null, 2)

			}</code>}

        </>}

	</ToolNote>;
}


export function ToolNote({

	warning=false,

	icon,
	text,

	onAccept,

	children

}: {

	warning?: boolean

	icon?: ReactNode
	text?: ReactNode

	onAccept?: () => void

	children?: ReactNode

}) {

	const _icon=icon || (warning ? <AlertTriangle/> : onAccept ? <HelpCircle/> : <Info/>);

	return createElement("tool-note", {

		class: classes({

			warning: warning,
			question: onAccept !== undefined

		})

	}, <>

		{onAccept
			? <button onClick={onAccept}>{_icon}{text}</button>
			: <span>{_icon}{text}</span>
		}

		{children}

	</>);

}