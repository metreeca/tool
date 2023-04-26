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

import { error, isArray, isObject, Type } from "@metreeca/core";
import { isLocal, Local, text }           from "@metreeca/core/local";
import { isString }                       from "@metreeca/core/string";
import { isValue, Value }                 from "@metreeca/core/value";


/**
 * Graph entry point.
 */
export interface Entry extends Frame {

	readonly id: string;

	readonly label?: string | Local;
	readonly brief?: string | Local;
	readonly image?: string | Entry;

}

/**
 * Linked data frame.
 */
export interface Frame {

	readonly [field: string]: undefined | null | Value | ReadonlyArray<null | Value>;

}


export interface Order {

	[expression: string]: "increasing" | "decreasing";

}

/**
 *
 */
export interface Slice {

	readonly "^": Order;

	readonly "@": number;
	readonly "#": number;

}

/**
 * Error trace.
 */
export interface Trace {

	readonly status: number;
	readonly reason: string;

	readonly detail?: Value;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const entry: Type<Entry>={

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


	format(value) {
		return toEntryString(value);
	}

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isEntry(value: unknown): value is Entry {
	return isFrame(value) && isString(value.id);
}

export function isFrame(value: unknown): value is Frame {
	return isObject(value) && Object.entries(value).every(([key, value]) => isString(key) && (
		value === undefined || value === null || isValue(value)
		|| isArray(value) && value.every(value => value === null || isValue(value))
	));
}

export function isOrder(value: unknown): value is Order {
	return isObject(value) && Object.entries(value).every(([key, value]) => isString(key) && (
		value === "increasing" || value || "decreasing"
	));
}


export function asEntry(value: unknown): undefined | Entry {
	return isEntry(value) ? value : undefined;
}

export function asFrame(value: unknown): undefined | Frame {
	return isFrame(value) ? value : undefined;
}

export function asOrder(value: unknown): undefined | Order {
	return isOrder(value) ? value : undefined;
}


export function toEntryString(value: Entry, {

	locales=navigator.languages

}: {

	locales?: Intl.LocalesArgument

}={}): string {

	return label(value, locales);

}

export function toFrameString(value: Frame, {

	locales=navigator.languages

}: {

	locales?: Intl.LocalesArgument

}={}): string {

	return JSON.stringify(value);

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


/**
 * Cleans frames, recursively removing undefined values and non-id fields from nested frames.
 *
 * @param frame
 */
export function clean<F extends Frame>(frame: F): typeof frame {

	return Object.entries(frame).reduce((f, [label, value]) => {

		const v=clean(value);

		return v === undefined ? f : { ...f, [label]: v };

	}, {} as F);


	function clean(value: Frame[string]): typeof value { // retain only entry identifiers

		if ( isObject(value) && "id" in value ) {

			return { id: value.id };

		} else if ( isArray<Value>(value) ) {

			return value.map(clean) as Value[];

		} else {

			return value;

		}

	}

}