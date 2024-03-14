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

import { error, immutable, Type } from "@metreeca/core/index";
import { isNumber } from "@metreeca/core/number";


export const integer: Type<number>=immutable({

	label: "integer",
	model: -0, // ;( use sign to take apart integer (-0) and decimal (0.0) models; see index.ts#toType()


	encode(value) {
		return Math.trunc(value);
	},

	decode(value) {
		return isNumber(value) ? Math.trunc(value)
			: error(new TypeError(`<${typeof value}> value <${value}> is not a <${integer.label}>`));
	},


	write(value) {
		return value?.toFixed(0);
	},

	parse(value) {

		const number=parseInt(value);

		return !isNaN(number) ? number
			: error(new TypeError(`<${value}> is not a <${integer.label}> string`));
	},


	format(value, locales) {
		return toIntegerString(value, { locales });
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is an integer number.
 */
export function isInteger(value: unknown): value is number {
	return Number.isInteger(value);
}

export function asInteger(value: unknown): undefined | number {
	return isInteger(value) ? value : undefined;
}


export function toIntegerString(value: number, {

	locales=navigator.languages,

	...opts

}: Intl.NumberFormatOptions & {

	locales?: Intl.LocalesArgument

}={}): string {

	return value.toLocaleString(locales, {

		maximumFractionDigits: 0,

		...opts

	});

}