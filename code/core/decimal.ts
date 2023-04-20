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
import { isNumber } from "@metreeca/core/number";


export const decimal: Type<number>={

	label: "decimal",
	model: -0.0, // ;( see index.ts#toType()


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


	format(value) {
		return toDecimalString(value);
	}

};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is a decimal number.
 */
export function isDecimal(value: unknown): value is number {
	return isNumber(value);
}

export function asInteger(value: unknown): undefined | number {
	return isDecimal(value) ? value : undefined;
}


export function toDecimalString(value: number, {

	locales=navigator.languages,

	minimumFractionDigits,
	maximumFractionDigits,

	...opts

}: Intl.NumberFormatOptions & {

	locales?: Intl.LocalesArgument

}={}): string {

	return value.toLocaleString(locales, {

		minimumFractionDigits,
		maximumFractionDigits: maximumFractionDigits ?? minimumFractionDigits,

		...opts

	});

}