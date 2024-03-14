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

import { error, immutable, Type } from "@metreeca/core";
import { Frame, isFrame } from "@metreeca/core/frame";
import { isLocal, Local, text } from "@metreeca/core/local";
import { isString } from "@metreeca/core/string";


/**
 * Graph entry point.
 */
export interface Entry extends Frame {

	readonly id: string;

	readonly label?: string | Local;
	readonly comment?: string | Local;
	readonly image?: string | Entry;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const entry: Type<Entry> & ((model: Entry) => Type<Entry>)=Object.freeze(Object.assign(
	(model: Entry) => immutable({ ...entry, model }), immutable<Type<Entry>>({

		label: "entry",
		model: { id: "", label: "" },


		encode(value) {
			return value;
		},

		decode(value) {
			return isEntry(value) ? value
				: error(new TypeError(`<${typeof value}> value <${value}> is not a <${entry.label}>`));
		},


		write(value) {
			return id(value);
		},

		parse(value) {
			return { id: value };
		},


		format(value, locales) {
			return toEntryString(value, { locales });
		}

	})
));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isEntry(value: unknown): value is Entry {
	return isFrame(value) && isString(value.id);
}

export function asEntry(value: unknown): undefined | Entry {
	return isEntry(value) ? value : undefined;
}


export function toEntryString(value: Entry, {

	locales=navigator.languages

}: {

	locales?: Intl.LocalesArgument

}={}): string {

	return label(value, locales);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function id(entry: Entry): string {
	return entry.id;
}

export function label(entry: Entry, locales: Intl.LocalesArgument=navigator.languages): string {
	return isString(entry.label) ? entry.label
		: isLocal(entry.label) ? text(entry.label, locales)
			: guess(id(entry));
}

/**
 * Guesses a resource label from its id.
 *
 * @param id the resource id
 *
 * @returns a label guessed from `id` or an empty string, if unable to guess
 */
export function guess(id: string): string {
	return id
		.replace(/^.*?(?:[/#:]([^/#:]+))?(?:\/|#|#_|#id|#this)?$/, "$1") // extract label
		.replace(/([a-z-0-9])([A-Z])/g, "$1 $2") // split camel-case words
		.replace(/[-_]+/g, " ") // split kebab-case words
		.replace(/\b[a-z]/g, $0 => $0.toUpperCase()); // capitalize words
}


