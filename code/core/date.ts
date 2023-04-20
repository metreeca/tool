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

import { error, Type } from "@metreeca/core/index";
import { isString } from "@metreeca/core/string";


export const date: Type<Date>={

	label: "date",
	model: "1970-01-01",


	encode(value) {
		return date.write(value);
	},

	decode(value) {
		return isDate(value) ? date.parse(value)
			: error(new TypeError(`<${typeof value}> value <${value}> is not a <${date.label}> string`));
	},


	write(value) {
		return value.toISOString().substring(0, 10);
	},

	parse(value) {
		return isDate(value) ? new Date(`${value}T00:00:00Z`)
			: error(new TypeError(`<${value}> is not a <${date.label}> string`));
	},


	format(value) {
		return toDateString(value);
	}

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is an [xsd:date](https://www.w3.org/TR/xmlschema-2/#date) string.
 *
 * @param value the value to be checked
 *
 * @return `true` if `value` is a string containing a valid lexical representation of an `xsd:date` value;
 * `false` otherwise
 */
export function isDate(value: unknown): value is string {
	return isString(value) && value.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
}

export function asDate(value: unknown): undefined | string {
	return isDate(value) ? value : undefined;
}


export function toDateString(value: Date, {

	locales=navigator.languages,

	...opts

}: Intl.DateTimeFormatOptions & {

	locales?: Intl.LocalesArgument

}={}): string {

	return value.toLocaleDateString(locales, {

		year: "numeric",
		month: "2-digit",
		day: "2-digit",

		dateStyle: "short",

		...opts

	});

}
