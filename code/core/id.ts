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


export const id: Type<string>=immutable({

	label: "id",
	model: "", // empty to be interpreted as relative


	encode(value) {
		return value;
	},

	decode(value) {
		return isId(value) ? value
			: error(new TypeError(`<${typeof value}> value  not a <${id.label}>`));
	},


	write(value) {
		return value;
	},

	parse(value) {
		return value;
	},


	format(value, locales) {
		return toIdString(value, { locales });
	},


	cast(type: Type): typeof id {
		return inconvertible(id, type);
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is an absolute or root-relative IRI.
 */
export function isId(value: unknown): value is string {
	return isString(value) && /^(?:\w+:|\/)[^\W]*/.test(value);
}

export function asId(value: unknown): undefined | string {
	return isId(value) ? value : undefined;
}


export function toIdString(value: string, {

	compact=false

}: {

	locales?: Intl.LocalesArgument,

	compact?: boolean

}={}): string {

	if ( compact ) {

		const url=new URL(value); // !!! error handling

		const host=url.host;
		const lang=url.pathname.match(/\b[a-z]{2}\b(?!-)/i); // ignore things like '/wp-document/

		return lang ? `${host} (${lang[0].toLowerCase()})` : host;

	} else {

		return value;

	}

}
