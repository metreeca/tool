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

import { error, immutable, inconvertible, Type } from "@metreeca/core/index";
import { isString } from "@metreeca/core/string";


export const time: Type<string, Date>=immutable({

	label: "time",
	model: "00:00:00",


	encode(value) {
		return time.write(value);
	},

	decode(value) {
		return isTime(value) ? time.parse(value)
			: error(new TypeError(`<${typeof value}> value <${value}> is not a <${time.label}> string`));
	},


	write(value) {
		return value.toISOString().substring(11);
	},

	parse(value) {
		return isTime(value) ? new Date(`1970-01-01T${value}Z`)
			: error(new TypeError(`<${value}> is not a <${time.label}> string`));
	},


	format(value, locales) {
		return toTimeString(value, { locales });
	},


	cast(type: Type): typeof time {
		return inconvertible(time, type);
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is an [xsd:time](https://www.w3.org/TR/xmlschema-2/#time) string.
 *
 * @param value the value to be checked
 *
 * @return `true` if `value` is a string containing a valid lexical representation of an `xsd:time` value;
 * `false` otherwise
 */
export function isTime(value: unknown): value is string {
	return isString(value) && value.match(/^\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/) !== null;
}

export function asTime(value: unknown): undefined | string {
	return isTime(value) ? value : undefined;
}


export function toTimeString(value: Date, {

	locales,

	...opts

}: Intl.DateTimeFormatOptions & {

	locales?: Intl.LocalesArgument

}={}): string {

	return value.toLocaleTimeString(locales, {

		hour: "numeric",
		minute: "numeric",
		second: undefined,

		...opts

	});

}
