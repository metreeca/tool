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


export const boolean: Type<boolean>=immutable({

	label: "boolean",
	model: false,


	encode(value=false) {
		return value;
	},

	decode(value=false) {
		return isBoolean(value) ? value
			: error(new TypeError(`<${typeof value}> value  not a <${boolean.label}>`));
	},


	write(value) {
		return value.toString();
	},

	parse(value) {
		return value === "true";
	},


	format(value) {
		return toBooleanString(value);
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is a boolean.
 */
export function isBoolean(value: unknown): value is boolean {
	return typeof value === "boolean";
}

export function asBoolean(value: unknown): undefined | boolean {
	return isBoolean(value) ? value : undefined;
}


export function toBooleanString(value: boolean, {

	locales=navigator.languages

}: {

	locales?: Intl.LocalesArgument

}={}): string {

	return value.toLocaleString(); // !!! selected locale

}