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

import { isDate } from "@metreeca/core/date";
import { isDateTime } from "@metreeca/core/dateTime";
import { isTime } from "@metreeca/core/time";


/**
 * Checks if a value is an [xsd:date/time](https://www.w3.org/TR/xmlschema-2/#built-in-primitive-datatypes) string.
 *
 * @param value the value to be checked
 *
 * @return `true` if `value` is a string containing a valid lexical representation of an `xsd:date/time` value;
 * `false` otherwise
 */
export function isTemporal(value: unknown): value is string {
	return isDateTime(value) || isDate(value) || isTime(value);
}

export function asTemporal(value: unknown): undefined | string {
	return isTemporal(value) ? value : undefined;
}