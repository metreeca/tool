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
 * Localized strings.
 *
 * https://www.rfc-editor.org/rfc/rfc5646.html#section-2.2.9
 *
 * @module
 */

import { error, immutable, isArray, isObject, Type } from "@metreeca/core/index";
import { isString } from "@metreeca/core/string";


export interface Local {

	readonly [lang: string]: string; // !!! string arrays?

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const local: Type<Local> & ((model: Local) => Type<Local>)=Object.freeze(Object.assign(
	(model: Local) => immutable({ ...local, model }), immutable<Type<Local>>({

		label: "local",
		model: { "*": "" },


		encode(value) {
			return value;
		},

		decode(value) {
			return isLocal(value) ? value
				: error(new TypeError(`<${typeof value}> value <${value}> is not a <${local.label}>`));
		},


		write(value) {
			return toLocalString(value);
		},

		parse(value) {
			return { [navigator.languages[0] ?? ""]: value }; // !!! review
		},


		format(value, locales) {
			return toLocalString(value, { locales });
		}

	})
));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isLocal(value: unknown): value is Local {
	return isObject(value) && !("id" in value) && Object.entries(value).every(([key, value]) =>
		isString(key) && /^|\*|[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(key)
		&& isString(value) // !!! string arrays?
	);
}

export function asLocal(value: unknown): undefined | Local {
	return isLocal(value) ? value : undefined;
}


export function toLocalString(local: Local, {

	locales

}: {

	locales?: Intl.LocalesArgument

}={}): string {

	return (isArray<any>(locales) ? locales.map(locale => local[locale.toString()]).filter(s => s)[0] : undefined)
		?? local.en
		?? Object.values(local)[0]
		?? "";

}