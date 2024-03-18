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


export const string: Type<string>=immutable({

	label: "string",
	model: "",


	encode(value) {
		return value;
	},

	decode(value) {
		return isString(value) ? value
			: error(new TypeError(`<${typeof value}> value <${value}> is not a <${string.label}>`));
	},


	write(value) {
		return value;
	},

	parse(value) {
		return value;
	},


	format(value) {
		return value;
	},


	cast(type: Type): typeof string {
		return inconvertible(string, type);
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is a string.
 */
export function isString(value: unknown): value is string {
	return typeof value === "string";
}

export function asString(value: unknown): undefined | string {
	return isString(value) ? value : undefined;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function normalize(string: string): string {
	return string.trim().replace(/\s+/g, " ");
}
