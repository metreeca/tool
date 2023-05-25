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

import { Setter } from "@metreeca/data/hooks";
import { Trace } from "@metreeca/link";
import { createContext, createElement, ReactNode, useContext, useState } from "react";


export type Value=undefined | Trace;
export type Change=Setter<Value>;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Context=createContext<[Value, Change]>([undefined, () => {}]);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolTrace({

	children

}: {

	children: ReactNode

}) {

	const value=useState<Trace>();

	return createElement(Context.Provider, { value, children });

}


export function useTrace(): [Value, Change] {
	return useContext(Context);
}
