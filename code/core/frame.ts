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

import { isEntry } from "@metreeca/core/entry";
import { error, immutable, isArray, isEmpty, isObject, Type } from "@metreeca/core/index";
import { isInteger } from "@metreeca/core/integer";
import { isLocal, Local, toLocalString } from "@metreeca/core/local";
import { isString } from "@metreeca/core/string";
import { evaluate, isValue, Value } from "@metreeca/core/value";


/**
 * Linked data frame.
 */
export interface Frame {

	readonly [field: string]: undefined | Value | ReadonlyArray<Value>;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Query extends Frame { // expression-based fields for reference only

	readonly "<{expression}"?: Value;
	readonly "<={expression}"?: Value;
	readonly "<<{expression}"?: Value;

	readonly ">{expression}"?: Value;
	readonly ">={expression}"?: | Value;
	readonly ">>{expression}"?: Value;

	readonly "~{expression}"?: string;

	readonly "?{expression}"?: Value[] | Local;

}

export interface Focus extends Frame { // expression-based fields for reference only

	readonly "${expression}"?: Value[] | Local;

}

export interface Order {

	readonly [expression: string]: undefined | "increasing" | "decreasing" | number;

}

export interface Slice {

	readonly "@"?: number,
	readonly "#"?: number

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const frame: Type<Frame> & ((model: Frame) => Type<Frame>)=Object.freeze(Object.assign(
	(model: Frame) => immutable({ ...frame, model }), immutable<Type<Frame>>({

		label: "frame",
		model: {},


		encode(value) {
			return value;
		},

		decode(value) {
			return isFrame(value) ? value
				: error(new TypeError(`<${typeof value}> value <${value}> is not a <${frame.label}>`));
		},


		write(value) {
			return toFrameString(value);
		},

		parse(value) {
			return {};
		},


		format(value, locales) {
			return toFrameString(value, { locales });
		}

	})
));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isFrame(value: unknown): value is Frame {
	return isObject(value) && Object.entries(value).every(([key, value]) => isString(key) && (
		value === undefined || isValue(value) || isArray(value, isValue)
	));
}

export function asFrame(value: unknown): undefined | Frame {
	return isFrame(value) ? value : undefined;
}


export function toFrameString(value: Frame, {

	locales

}: {

	locales?: Intl.LocalesArgument

}={}): string {

	return isString(value.label) ? value.label

		: isLocal(value.label) ? toLocalString(value.label, { locales })

			: isString(value.id) ? value.id // guess entry label from its id
					.replace(/^.*?(?:[/#:]([^/#:]+))?(?:\/|#|#_|#id|#this)?$/, "$1") // extract label
					.replace(/([a-z-0-9])([A-Z])/g, "$1 $2") // split camel-case words
					.replace(/[-_]+/g, " ") // split kebab-case words
					.replace(/\b[a-z]/g, $0 => $0.toUpperCase())

				: JSON.stringify(value);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function sortFrames<F extends Frame>(frames: F[], locales?: Intl.LocalesArgument): typeof frames {

	return [...frames].sort((x, y) => toFrameString(x, { locales }).localeCompare(toFrameString(y, { locales })));

}


/**
 * Extracts the model component of a frame.
 *
 * Recursively removes:
 *
 * - undefined values
 * - query/focus/order fields
 *
 * @param frame the frame to be processed
 */
export function toModel<V extends Frame>(frame: V): typeof frame {

	return Object.entries(frame).reduce((f, [label, value]) => {

		if ( label.match(/^['\w]/) ) { // retain only plain or quoted labels

			const v=clean(value);

			return v === undefined ? f : { ...f, [label]: v };

		} else {

			return f;

		}

	}, {} as V);


	function clean(value: Frame[string]): typeof value {

		// !!! if ( isObject(value) && "id" in value ) { // retain only entry identifiers for write operations
		//
		// 	return { id: value.id };
		//
		// }

		if ( isArray<Value>(value) ) {

			return value.map(clean) as Value[];

		} else {

			return value;

		}

	}

}

/**
 * Extracts the query component of a frame
 *
 * @param frame the frame to be processed
 * @param normalize if false, ignore non-filtering fields; otherwise, convert them to `any` filtering fields,
 *     converting scalar values into arrays as required (for instance, { field: "value" } => { "?field": ["value"] })
 */
export function toQuery(frame: Frame, normalize: boolean=false): Query {
	return Object.entries(frame).reduce((query, [label, value]) => {

		if ( label.startsWith("<=") && isValue(value) ) {

			return { ...query, [label]: value };

		} else if ( label.startsWith("<<") && isValue(value) ) {

			return { ...query, [label]: value };

		} else if ( label.startsWith(">=") && isValue(value) ) {

			return { ...query, [label]: value };

		} else if ( label.startsWith(">>") && isValue(value) ) {

			return { ...query, [label]: value };

		} else if ( label.startsWith("<") && isValue(value) ) {

			return { ...query, [label]: value };

		} else if ( label.startsWith(">") && isValue(value) ) {

			return { ...query, [label]: value };

		} else if ( label.startsWith("~") && isString(value) ) {

			return { ...query, [label]: value };

		} else if ( label.startsWith("?") && isArray(value, isValue) ) {

			return { ...query, [label]: value };

		} else if ( normalize && isArray(value, isValue) ) {

			return { ...query, [`?${label}`]: value };

		} else if ( normalize && isValue(value) ) {

			return { ...query, [`?${label}`]: [value] };

		} else {

			return query;

		}

	}, {});
}


export function encodeQuery(query: Query): string {

	if ( isEmpty(query) ) {

		return "";

	} else {

		const params=new URLSearchParams();

		Object.entries(query).forEach(([label, value]) => {

			if ( label.startsWith("<=") && isValue(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith("<<") && isValue(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith(">=") && isValue(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith(">>") && isValue(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith("<") && isValue(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith(">") && isValue(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith("~") && isString(value) ) {

				params.set(label, encode(value));

			} else if ( label.startsWith("?") && isArray(value, isValue) ) {

				value.forEach(v => params.append(label.substring(1), encode(v)));

			}

		});

		return params.toString();


		function encode(value: null | Value): string {
			return value === null ? "null"
				: isEntry(value) ? value.id
					: value.toString();
		}

	}

}

export function decodeQuery(search: undefined | null | string): undefined | Query {
	try {

		if ( search ) {

			const query: { -readonly [K in keyof Frame]: Frame[K] }={};

			new URLSearchParams(search).forEach((value, label) => {

				if ( label.startsWith("<=") ) {

					query[label]=decode(value);

				} else if ( label.startsWith("<<") ) {

					query[label]=decode(value);

				} else if ( label.startsWith(">=") ) {

					query[label]=decode(value);

				} else if ( label.startsWith(">>") ) {

					query[label]=decode(value);

				} else if ( label.startsWith("<") ) {

					query[label]=decode(value);

				} else if ( label.startsWith(">") ) {

					query[label]=decode(value);

				} else if ( label.startsWith("~") ) {

					query[label]=decode(value);

				} else if ( label.startsWith("?") ) {

					query[label]=[...(query[label] as [] ?? []), decode(value)];

				} else {

					query[`?${label}`]=[...(query[label] as [] ?? []), decode(value)];

				}

			});


			return query;


			function decode(value: string): null | Value {
				return value === "null" ? null
					: value === "true" ? true
						: value === "false" ? false
							: value.match(/^[-+]?\d+(?:\.\d+)?(?:e[-+]\d+)?$/i) ? parseFloat(value)
								: value.match(/^\w+:|^\//) ? { id: value } // absolute or root-relative IRI
									: value;
			}

		} else {

			return undefined;

		}

	} catch ( e ) {

		console.warn("malformed search string <%o> / %o", search, e);

		return undefined;

	}
}


export function Order(frame: Frame, expression: string, criterion: Order[string]) {
	return {

		[isEntry(evaluate(frame, expression)) ? `^${expression}.label` : `^${expression}`]: criterion === "increasing" || criterion === "decreasing" || isInteger(criterion) ? criterion : undefined

	};
}

