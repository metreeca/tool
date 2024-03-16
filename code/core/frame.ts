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

import { error, immutable, isArray, isObject, Type } from "@metreeca/core/index";
import { isLocal, toLocalString } from "@metreeca/core/local";
import { isString } from "@metreeca/core/string";
import { isValue, Value } from "@metreeca/core/value";


/**
 * Linked data frame.
 */
export interface Frame {

	readonly [field: string]: undefined | Value | ReadonlyArray<Value>;

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
			: JSON.stringify(value);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Cleans frames, recursively removing undefined values and non-id fields.
 *
 * @param frame
 */
export function clean<F extends Frame>(frame: F): typeof frame {

	return Object.entries(frame).reduce((f, [label, value]) => {

		const v=clean(value);

		return v === undefined ? f : { ...f, [label]: v };

	}, {} as F);


	function clean(value: Frame[string]): typeof value { // retain only entry identifiers

		if ( isObject(value) && "id" in value ) {

			return { id: value.id };

		} else if ( isArray<Value>(value) ) {

			return value.map(clean) as Value[];

		} else {

			return value;

		}

	}

}