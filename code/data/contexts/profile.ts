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

import { ToolFetcher, useFetcher } from "@metreeca/data/contexts/fetcher";
import { useStorage } from "@metreeca/data/hooks/storage";
import { createContext, createElement, ReactNode, useContext } from "react";


export type Value<P>=null | P
export type Delta<P, C>=(credentials: null | C) => Promise<null | P>
export type State<P, C>=[Value<P>, Delta<P, C>]


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Context=createContext<State<any, any>>([
	null, () => Promise.resolve(null)
]);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a profile manager.
 *
 *
 * @typeParam P profile
 * @typeParam C credentials
 *
 * @param manager
 * @param children
 *
 * @constructor
 */
export function ToolProfile<P, C>({

	manager,

	children

}: {

	manager: Delta<P, C>

	children: ReactNode

}) {

	const fetcher=useFetcher();

	const [profile, setProfile]=useStorage<null | P>(sessionStorage, "profile", null);


	return ToolFetcher({

		fetcher: fetcher.intercept(delegate => delegate), // !!! interceptor

		children: createElement(Context.Provider, {

			value: [profile, credentials => manager(credentials).then(profile => {

				setProfile(profile);

				return profile;

			})]

		}, children)

	});

}


/**
 * Use the nearest profile manager.
 **
 * @returns the the nearest profile manager or a dummy global manager, if none is found
 */
export function useProfile<P, C>(): State<P, C> {
	return useContext<State<P, C>>(Context);
}
