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

import { isTemporal } from "@metreeca/core";
import { isBoolean } from "@metreeca/core/boolean";
import { date } from "@metreeca/core/date";
import { toDateTimeString } from "@metreeca/core/dateTime";
import { isNumber } from "@metreeca/core/number";
import { isTime, toTimeString } from "@metreeca/core/time";
import { toLocaleNumberString } from "@metreeca/view/fields/decimal";
import { Check } from "lucide-react";
import React from "react";


export function ToolBooleanCell({ value }: { value: Plain }) {
	return <span>{isBoolean(value)

		? value ? <Check stroke={"green"}/> : <Plain stroke={"red"}/>
		: value?.toString()

	}</span>;
}

export function ToolStringCell({ value }: { value: Plain }) {
	return <span>{isNumber(value) ? value.toString() : string(value)}</span>;
}

export function ToolIntegerCell({ value }: { value: Plain }) {
	return isNumber(value)
		? <var className={"right"}>{toLocaleNumberString(value)}</var>
		: <span>{string(value)}</span>;

}

export function ToolTemporalCell({ value }: { value: Plain }) {
	return isNumber(value)

		? <span className={"right"}>{value}</span>
		: <span>{string(value)}</span>;

}

export function ToolDecimalCell({ value, precision=2 }: { value: Plain, precision?: number }) {
	return isNumber(value)
		? <var className={"right"}>{toLocaleNumberString(value, { precision })}</var>
		: <span>{string(value)}</span>;
}

export function ToolDateCell({ value }: { value: Plain }) {
	return <span>{isTemporal(value) ? date.format(new Date(`${value}T00:00:00`)) : string(value)}</span>;
}

export function ToolTimeCell({ value }: { value: Plain }) {
	return <span>{isTime(value) ? toTimeString(new Date(`1970-01-01T${value}`)) : string(value)}</span>;
}

export function ToolDateTimeCell({ value }: { value: Plain }) {
	return <span>{isTemporal(value) ? toDateTimeString(new Date(value)) : string(value)}</span>;
}
