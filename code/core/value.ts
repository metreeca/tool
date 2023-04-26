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

import { isBoolean, toBooleanString }                            from "@metreeca/core/boolean";
import { date, isDate, toDateString }                            from "@metreeca/core/date";
import { dateTime, isDateTime, toDateTimeString }                from "@metreeca/core/dateTime";
import { Frame, isEntry, isFrame, toEntryString, toFrameString } from "@metreeca/core/entry";
import { isArray }                                               from "@metreeca/core/index";
import { isLocal, Local, toLocalString }                         from "@metreeca/core/local";
import { isNumber, toNumberString }                              from "@metreeca/core/number";
import { isString }                                              from "@metreeca/core/string";
import { isTime, time, toTimeString }                            from "@metreeca/core/time";
import { isYear, toYearString, year }                            from "@metreeca/core/year";


export type Value=null | boolean | number | string | Local | Frame


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function isValue(value: unknown): value is Value {
	return value === null
		|| isBoolean(value)
		|| isNumber(value)
		|| isString(value)
		|| isFrame(value)
		|| isLocal(value); // as a last resort to avoid expensive checks
}

export function asValue(value: unknown): undefined | Value {
	return isValue(value) ? value : undefined;
}


export function toValueString(value: Value, {

	locales,

	asNumber,
	asDateTime

}: {

	locales?: Intl.LocalesArgument

	asNumber?: Intl.NumberFormatOptions
	asDateTime?: Intl.DateTimeFormatOptions

}={}): string {

	return value === null ? "null"

		: isBoolean(value) ? toBooleanString(value, { locales })
			: isNumber(value) ? toNumberString(value, { locales, ...asNumber })

				: isDateTime(value) ? toDateTimeString(dateTime.parse(value) ?? new Date(), { locales, ...asDateTime })
					: isDate(value) ? toDateString(date.parse(value) ?? new Date(), { locales, ...asDateTime })
						: isTime(value) ? toTimeString(time.parse(value) ?? new Date(), { locales, ...asDateTime })
							: isYear(value) ? toYearString(year.parse(value) ?? new Date(), { locales, ...asDateTime })

								: isString(value) ? value
									: isLocal(value) ? toLocalString(value, { locales })

										: isEntry(value) ? toEntryString(value, { locales })
											: toFrameString(value, { locales });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function equals(x: unknown, y: unknown): boolean {
	return isArray(x) && isArray(y) ? x.length === y.length && x.every((v, i) => equals(v, y[i]))
		: isEntry(x) && isEntry(y) ? x.id === y.id
			: x === y;
}

export function model(value: unknown, expression: string): undefined | Value {

	let _value=value;
	let _expression=expression;

	while ( true ) {

		if ( _expression === "" && isValue(_value) ) {

			return _value;

		} else if ( isFrame(_value) ) {

			if ( !_expression.match(/\w+/) ) {
				throw new Error(";( complex expressions to be implemented"); // !!!
			}

			_value=_value[_expression];
			_expression="";

		} else if ( isArray(_value) ) {

			_value=_value[0];
			// !!! expression?

		} else {

			return undefined;

		}

	}

}
