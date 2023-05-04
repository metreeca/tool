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

import { date } from "@metreeca/core/date";
import { error, immutable, Type } from "@metreeca/core/index";
import { isString } from "@metreeca/core/string";


export const dateTime: Type<Date>=immutable({

	label: "dateTime",
	model: "1970-01-01T00:00:00Z",


	encode(value) {
		return date.write(value);
	},

	decode(value) {
		return isDateTime(value) ? date.parse(value)
			: error(new TypeError(`<${typeof value}> value <${value}> is not a <${dateTime.label}> string`));
	},


	write(value) {
		return value.toISOString();
	},

	parse(value) {
		return isDateTime(value) ? new Date(value)
			: error(new TypeError(`<${value}> is not a <${dateTime.label}> string`));
	},


	format(value) {
		return toDateTimeString(value);
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is an [xsd:dateTime](https://www.w3.org/TR/xmlschema-2/#dateTime) string.
 *
 * @param value the value to be checked
 *
 * @return `true` if `value` is a string containing a valid lexical representation of an `xsd:dateTime` value;
 * `false` otherwise
 */
export function isDateTime(value: unknown): value is string {
	return isString(value) && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(\+\d{2}:\d{2}|Z)?$/) !== null;
}

export function asDateTime(value: unknown): undefined | string {
	return isDateTime(value) ? value : undefined;
}


export function toDateTimeString(value: Date, {

	locales=navigator.languages,

	...opts

}: Intl.DateTimeFormatOptions & {

	locales?: Intl.LocalesArgument

}={}): string {

	return value.toLocaleString(locales, {

		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",

		dateStyle: "short",
		timeStyle: "short",

		...opts

	});

}