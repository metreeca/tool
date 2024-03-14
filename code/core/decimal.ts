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


export const decimal: Type<number>=immutable({

	label: "decimal",
	model: 0.0,


	encode(value) {
		return value;
	},

	decode(value) {
		return isNumber(value) ? value
			: error(new TypeError(`<${typeof value}> value <${value}> is not a <${decimal.label}>`));
	},


	write(value) {
		return value?.toLocaleString(undefined, {
			useGrouping: false,
			minimumFractionDigits: 1,
			maximumFractionDigits: 20
		});
	},

	parse(value) {

		const number=parseFloat(value);

		return !isNaN(number) ? number
			: error(new TypeError(`<${value}> is not a <${decimal.label}> string`));
	},


	format(value, locales) {
		return toDecimalString(value, { locales });
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is a decimal number.
 */
export function isDecimal(value: unknown): value is number {
	return Number.isFinite(value);
}

export function asDecimal(value: unknown): undefined | number {
	return isDecimal(value) ? value : undefined;
}


export function toDecimalString(value: number, {

	locales,

	fractionDigits,

	minimumFractionDigits,
	maximumFractionDigits,

	...opts

}: Intl.NumberFormatOptions & Partial<Readonly<{

	locales?: Intl.LocalesArgument

	fractionDigits: number

}>>/* ;( */={}): string {

	return value.toLocaleString(locales, {

		minimumFractionDigits: minimumFractionDigits ?? fractionDigits,
		maximumFractionDigits: maximumFractionDigits ?? fractionDigits,

		...opts

	});

}