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

import { error, immutable, Type } from "@metreeca/core/index";
import { isString } from "@metreeca/core/string";


export const year: Type<Date>=immutable({

	label: "year",
	model: "1970",


	encode(value) {
		return year.write(value);
	},

	decode(value) {
		return isYear(value) ? year.parse(value)
			: error(new TypeError(`<${typeof value}> value <${value}> is not a <${year.label}> string`));
	},


	write(value) {
		return value.toISOString().substring(4);
	},

	parse(value) {
		return isYear(value) ? new Date(`${value}-01-01T00:00:00Z`)
			: error(new TypeError(`<${value}> is not a <${year.label}> string`));
	},


	format(value) {
		return toYearString(value);
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is an [xsd:time](https://www.w3.org/TR/xmlschema-2/#gYear) string.
 *
 * @param value the value to be checked
 *
 * @return `true` if `value` is a string containing a valid lexical representation of an `xsd:gYear` value;
 * `false` otherwise
 */
export function isYear(value: unknown): value is string {
	return isString(value) && value.match(/^\d{4}$/) !== null;
}

export function asYear(value: unknown): undefined | string {
	return isYear(value) ? value : undefined;
}


export function toYearString(value: Date, {

	locales=navigator.languages,

	...opts

}: Intl.DateTimeFormatOptions & {

	locales?: Intl.LocalesArgument

}={}): string {

	return value.getFullYear().toFixed(0); // !!! selected locale

}