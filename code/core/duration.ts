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

import { error, immutable, isObject, Type } from "@metreeca/core";
import { toIntegerString } from "@metreeca/core/integer";
import { toLocalString } from "@metreeca/core/local";
import { isString } from "@metreeca/core/string";


const Minus=`(?<minus>-)?`;

const Years=`(?:(?<years>\\d+)Y)?`;
const Months=`(?:(?<months>\\d+)M)?`;
const Days=`(?:(?<days>\\d+)D)?`;

const Hours=`(?:(?<hours>\\d+)H)?`;
const Minutes=`(?:(?<minutes>\\d+)M)?`;
const Seconds=`(?:(?<seconds>\\d+(?:\\.\\d+))S)?`;

const Duration=RegExp(`^P${Minus}${Years}${Months}${Days}(?:T${Hours}${Minutes}${Seconds})?$`);


const Keys: Set<string>=new Set(Object.keys(<Duration>{

	minus: false,

	years: 0,
	months: 0,
	days: 0,

	hours: 0,
	minutes: 0,
	seconds: 0.0

}));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Duration {

	minus?: boolean;

	years?: number;
	months?: number;
	days?: number;

	hours?: number;
	minutes?: number;
	seconds?: number;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * https://www.w3.org/TR/xmlschema-2/#duration
 */
export const duration: Type<string, Duration>=immutable({

	label: "duration",
	model: "",


	encode(value) {
		throw new Error(";( to be implemented"); // !!!
	},

	decode(value) {
		if ( isString(value) ) {

			const groups=value.match(Duration)?.groups;

			if ( groups ) {

				return {

					negative: !!groups.minus,

					years: parse(groups.years),
					months: parse(groups.months),
					days: parse(groups.days),

					hours: parse(groups.hours),
					minutes: parse(groups.minutes),
					seconds: parse(groups.seconds)

				};

			} else {

				return error(new TypeError(`malformed <${duration.label}> value <${value}}>`));

			}


		} else {

			return error(new TypeError(`<${typeof value}> value <${value}> is not a <${duration.label}>`));

		}


		function parse(s: undefined | string): undefined | number {
			return !s ? undefined : (parseFloat(s)) ?? undefined;
		}

	},


	write(value) {

		throw new Error(";( to be implemented"); // !!!

		// return value?.toFixed(0);
	},

	parse(value) {

		throw new Error(";( to be implemented"); // !!!

		// const number=parseInt(value);
		//
		// return !isNaN(number) ? number
		// 	: error(new TypeError(`<${value}> is not a <${integer.label}> string`));
	},


	format(value, locales) {
		throw new Error(";( to be implemented"); // !!!
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is an ISO duration string.
 */
export function isDuration(value: unknown): value is Duration {
	return isObject(value) && Object.keys(value).every(Keys.has);
}

export function asDuration(value: unknown): undefined | Duration {
	return isDuration(value) ? value : undefined;
}


export function toDurationString({

	minus,

	years,
	months,
	days,

	hours,
	minutes,
	seconds

}: Duration, {

	locales

}: {

	locales?: Intl.LocalesArgument

}={}): string {

	const opts={ locales };

	return [

		minus ? toLocalString(labels.minus, opts) : undefined,

		years && `${toIntegerString(years, opts)} ${toLocalString(years > 1 ? labels.years : labels.year, opts)}`,
		months && `${toIntegerString(months, opts)} ${toLocalString(months > 1 ? labels.months : labels.month, opts)}`,
		days && `${toIntegerString(days, opts)} ${toLocalString(days > 1 ? labels.days : labels.day, opts)}`,

		hours && `${toIntegerString(hours, opts)} ${toLocalString(hours > 1 ? labels.hours : labels.hour, opts)}`,
		minutes && `${toIntegerString(minutes, opts)} ${toLocalString(minutes > 1 ? labels.minutes : labels.minute, opts)}`,
		seconds && `${toIntegerString(seconds, opts)} ${toLocalString(seconds > 1 ? labels.seconds : labels.second, opts)}`

	].filter(v => v).join(" ");

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const labels=immutable({

	minus: {
		en: "minus",
		it: "meno"
	},


	year: {
		en: "year",
		it: "anno"
	},

	years: {
		en: "years",
		it: "anni"
	},

	month: {
		en: "month",
		it: "mese"
	},

	months: {
		en: "months",
		it: "mesi"
	},

	day: {
		en: "day",
		it: "giorno"
	},

	days: {
		en: "days",
		it: "giorni"
	},


	minute: {
		en: "minute",
		it: "minuto"
	},

	minutes: {
		en: "minutes",
		it: "minuti"
	},

	hour: {
		en: "hour",
		it: "ora"
	},

	hours: {
		en: "hours",
		it: "ore"
	},

	second: {
		en: "second",
		it: "secondo"
	},

	seconds: {
		en: "seconds",
		it: "secondi"
	}

});


