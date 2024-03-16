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


/**
 * Checks if a value is a finite number.
 */
export function isNumber(value: unknown): value is number {
	return Number.isFinite(value);
}

export function asNumber(value: unknown): undefined | number {
	return isNumber(value) ? value : undefined;
}


export function toNumberString(value: number, {

	locales,

	...opts

}: Intl.NumberFormatOptions & {

	locales?: Intl.LocalesArgument

}={}): string {

	return value.toLocaleString(locales, opts);

}


//// !!! ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const k=1.0e3;
const M=1.0e6;
const G=1.0e9;


function format(number: number, locales?: string | string[], options?: Intl.NumberFormatOptions) {
	return isNaN(number) ? ""
		: number < 10*k ? number.toLocaleString(locales, options)
			: number < M ? `${Math.round(number/k).toLocaleString(locales, options)}k`
				: number < G ? `${Math.round(number/M).toLocaleString(locales, options)}M`
					: `${Math.round(number/G).toLocaleString(locales, options)}G`;
}
