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


import { Frame } from "@metreeca/core/frame";
import React, { ReactNode } from "react";


/**
 * Dispatches an `input` event on the closest `form` element.
 *
 * The dispatched event triggers form validation and validity reporting: this is useful for reporting state changes
 * in complex form field inputs altering state without direct user interaction with editable input elements
 *
 * @param target
 */
export function input(target: HTMLElement) {

	const form=target.closest("form");

	Promise.resolve().then(() => {
		form?.dispatchEvent(new Event("input", { bubbles: true }));
	});

}

/**
 * Focuses an element.
 *
 * @param target
 */
export function focus(target: undefined | null | ChildNode) {

	if ( target instanceof HTMLElement ) {
		target.focus();
	}

}


/**
 * Creates a resource reading/editing form.
 *
 * @param onValidate
 * @param onSubmit
 * @param children
 *
 * @constructor
 */
export function ToolForm<F extends Frame>({

	onValidate,
	onSubmit,

	children

}: {

	onValidate?: (valid: boolean) => void
	onSubmit?: () => void

	children: ReactNode

}) {

	return <form ref={form => {

		if ( form && !form.contains(document.activeElement) ) {
			(form.querySelector("input:not([hidden]),textarea,select") as HTMLElement)?.focus();
		}

	}}

		onInput={e => {

			try {

				const validity=e.currentTarget.checkValidity();

				onValidate?.(validity);

			} finally {
				e.stopPropagation();
			}

		}}

		onSubmit={e => {

			try {

				if ( !(e.target instanceof HTMLButtonElement) ) { // forms submitted only through page-level controls
					onSubmit?.();
				}

			} finally {
				e.preventDefault();
				e.stopPropagation();
			}

		}}

	>

		<input type="submit" hidden/>

		{children}

	</form>;

}
