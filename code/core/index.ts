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

/**
 * Shared TypeScript type definitions and object handling utilities.
 *
 * @module
 */


import { boolean, isBoolean }   from "@metreeca/core/boolean";
import { date, isDate }         from "@metreeca/core/date";
import { dateTime, isDateTime } from "@metreeca/core/dateTime";
import { decimal, isDecimal }   from "@metreeca/core/decimal";
import { entry, isEntry }       from "@metreeca/core/entry";
import { integer, isInteger }   from "@metreeca/core/integer";
import { isLocal, local }       from "@metreeca/core/local";
import { isString, string }     from "@metreeca/core/string";
import { isTime, time }         from "@metreeca/core/time";
import { isValue, Value }       from "@metreeca/core/value";
import { isYear, year }         from "@metreeca/core/year";


/**
 * Primitive types.
 */
export type Primitive=undefined | null | boolean | number | string


export interface Type<V=any> {

	readonly label: string;
	readonly model: Value;


	encode(value: V): Value;

	decode(value: Value): V;


	write(value: V): string;

	parse(value: string): V;


	format(value: V): string;

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
 * Checks if a value is a function.
 */
export function isFunction(value: unknown): value is Function {
	return value instanceof Function;
}

export function isType<T>(value: unknown): value is Type<T> {
	return isObject(value)
		&& isString(value.label) && isValue(value.model)
		&& isFunction(value.encode) && isFunction(value.decode);
}


export function asObject(value: unknown): undefined | Record<any, any> & ({ bind?: never } | { call?: never }) {
	return isObject(value) ? value : undefined;
}

export function asArray<T>(value: unknown): undefined | T[] {
	return isArray<T>(value) ? value : undefined;
}


export function toType(model: unknown): Type {
	return isBoolean(model) ? boolean

		: isInteger(model) && !Object.is(model, -0) ? integer // ;( see decimal.ts#decimal.model
			: isDecimal(model) ? decimal

				: isYear(model) ? year
					: isDate(model) ? date
						: isTime(model) ? time
							: isDateTime(model) ? dateTime

								: isString(model) ? string
									: isLocal(model) ? local

										: isEntry(model) ? entry

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

		return Object.freeze(Object.getOwnPropertyNames(value as any).reduce((object: any, key) => {

			object[key]=immutable((value as any)[key]);

			return object;

		}, Array.isArray(value) ? [] : {}));

	} else {

		return value as any;

	}
}


export function error<V>(error: unknown): V {
	throw error;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export function required<T>(value: T | Type<T>): T {
	return model(value);
}

export function optional<T>(value: T | Type<T>): undefined | T {
	return model(value);
}

export function repeatable<T>(value: T | Type<T>): T[] {
	return [model(value)];
}

export function multiple<T>(value: T | Type<T>): undefined | T[] {
	return [model(value)];
}


export function model<T>(value: T | Type<T>): T {
	return isType<T>(value) ? value.decode(value.model) : value;
}