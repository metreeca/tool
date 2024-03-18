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
 * Shared TypeScript type definitions and object handling utilities.
 *
 * @module
 */

import { boolean, isBoolean } from "@metreeca/core/boolean";
import { date, isDate } from "@metreeca/core/date";
import { dateTime, isDateTime } from "@metreeca/core/dateTime";
import { decimal, isDecimal } from "@metreeca/core/decimal";
import { entry, isEntry } from "@metreeca/core/entry";
import { frame, isFrame } from "@metreeca/core/frame";
import { integer, isInteger } from "@metreeca/core/integer";
import { isLocal, local } from "@metreeca/core/local";
import { isString, string } from "@metreeca/core/string";
import { isTime, time } from "@metreeca/core/time";
import { isValue, Value } from "@metreeca/core/value";
import { isYear, year } from "@metreeca/core/year";


/**
 * Primitive types.
 */
export type Primitive=undefined | null | boolean | number | string


/**
 * @type <V> the JSON value type
 * @type <T> the native value type
 */
export interface Type<V extends Value=any, T=V> {

	readonly label: string;
	readonly model: V;


	/**
	 * Encodes a native value into a JSON value.
	 *
	 * @param value the native value to be encoded
	 */
	encode(value: T): V;

	/**
	 * Decodes a JSON value into a native value.
	 *
	 * @param value the JSON value to be decoded
	 */
	decode(value: V): T;


	/**
	 * Converts a native value into an editable textual representation.
	 *
	 * @param value the native value to be converted
	 */
	write(value: T): string;

	/**
	 * Converts an editable textual representation into a native string.
	 *
	 * @param string the textual representation to be converted
	 */
	parse(string: string): T;


	/**
	 * Converts a native value into a read-only localized textual representation.
	 *
	 * @param value the native value to be converted
	 * @param locales a string with a BCP 47 language tag, or an array of such strings
	 */
	format(value: T, locales?: Intl.LocalesArgument): string;


	cast(type: Type): Type<V, T>;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is not `undefined` or `null`.
 */
export function isDefined<T>(value: undefined | null | T): value is T {
	return value !== undefined && value !== null;
}

/**
 * Checks if a value is an empty plain object or an empty array.
 */
export function isEmpty(value: unknown): value is ({ [key in any]: never } | []) {
	return isArray(value) ? value.length === 0
		: isObject(value) ? Object.keys(value).length === 0
			: false;
}


/**
 * Checks if a value is a plain object.
 *
 * @see https://stackoverflow.com/a/52694022/739773
 */
export function isObject(value: unknown): value is Record<any, any> & ({ bind?: never } | { call?: never }) {
	return value !== undefined && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Checks if a value is an array.
 */
export function isArray<T=unknown>(value: unknown, is?: (value: unknown) => value is T): value is T[] {
	return Array.isArray(value) && (is === undefined || value.every(is));
}

/**
 * Checks if a value is a symbol.
 */
export function isSymbol(value: unknown): value is Symbol {
	return typeof value === "symbol";
}

/**
 * Checks if a value is a function.
 */
export function isFunction(value: unknown): value is Function {
	return value instanceof Function;
}

export function isType<V extends Value, T>(value: unknown): value is Type<V, T> { // parametric types are functions
	return isFunction(value) && isType({ ...value }) || isObject(value)
		&& isString(value.label)
		&& isValue(value.model)
		&& isFunction(value.encode)
		&& isFunction(value.decode);
}


export function asObject(value: unknown): undefined | Record<any, any> & ({ bind?: never } | { call?: never }) {
	return isObject(value) ? value : undefined;
}

export function asArray<T>(value: unknown, is?: (value: unknown) => value is T): undefined | T[] {
	return isArray<T>(value, is) ? value : undefined;
}


export function toType(model: unknown): Type {
	return isBoolean(model) ? boolean

		: isInteger(model) && Object.is(model, -0) ? integer // ;( see integer.ts#integer.model
			: isDecimal(model) ? decimal

				: isYear(model) ? year
					: isDate(model) ? date
						: isTime(model) ? time
							: isDateTime(model) ? dateTime

								: isString(model) ? string
									: isLocal(model) ? local

										: isEntry(model) ? entry
											: isFrame(model) ? frame

												: error(`unknown type for model value <${model}>`);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks deep object equality.
 *
 * Object pairs are deeply equal if they contain:
 *
 * - two equal {@link Primitive primitive} values or two equal functions
 * - two {@link isObject plain objects} with deeply equal entry sets
 * - two {@link isArray arrays} with pairwise deeply equal items
 *
 * @param x the target object to be checked for equality
 * @param y the reference object to be checked for equality
 *
 * @return `true` if `x` and `y` are deeply equal; `false` otherwise
 */
export function equals(x: unknown, y: unknown): boolean {

	function objectEquals(x: { [s: string | number | symbol]: unknown }, y: typeof x) {
		return Object.entries(x).every(([label, value]) => equals(value, y[label]))
			&& Object.entries(y).every(([label, value]) => equals(value, x[label]));
	}

	function arrayEquals(x: unknown[], y: typeof x) {
		return x.length === 0 ? y.length === 0
			: x.length === y.length && x.every((value, index) => equals(value, y[index]));
	}

	return isObject(x) ? isObject(y) && objectEquals(x, y)
		: isArray(x) ? isArray(y) && arrayEquals(x, y)
			: Object.is(x, y);
}

/**
 * Creates an immutable deep clone.
 *
 * @param value the value to be cloned
 *
 * @return a deeply immutable clone of `value`
 */
export function immutable<T=any>(value: T): Readonly<typeof value> {
	if ( value !== null && typeof value === "object" ) {

		return Object.freeze(Reflect.ownKeys(value as any).reduce((object: any, key) => {

			object[key]=isSymbol(key) ? (value as any)[key] : immutable((value as any)[key]);

			return object;

		}, Array.isArray(value) ? [] : {}));

	} else {

		return value as any;

	}
}


export function error<V>(error: unknown): V {
	throw error;
}

export function malformed<V>(type: Type, value: unknown): V {
	return error(new TypeError(`value <${value}> is not a <${type.label}> string`));
}

export function inconvertible<V>(type: Type, cast: Type): V {
	return error(new TypeError(`unsupported <${type.label}> cast from type <${cast.label}>`));
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function required<V extends Value, T>(value: V | Type<V, T>): V {
	return model(value);
}

export function optional<V extends Value, T>(value: V | Type<V, T>): undefined | V {
	return model(value);
}

export function repeatable<V extends Value, T>(value: V | Type<V, T>): V[] {
	return [model(value)];
}

export function multiple<V extends Value, T>(value: V | Type<V, T>): undefined | V[] {
	return [model(value)];
}


function model<V extends Value, T>(value: V | Type<V, T>): V {
	return isType<V, T>(value) ? value.model : value;
}