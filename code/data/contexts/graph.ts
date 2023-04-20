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

import { Graph } from "@metreeca/link";
import { Fetcher, useFetcher } from "@metreeca/data/contexts/fetcher";
import { createContext, createElement, ReactNode, useContext, useMemo } from "react";
import { RESTGraph } from "@metreeca/link/rest";


const Context=createContext<Graph>(RESTGraph(fetch));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * **Warning** / The `factory` argument must have a stable identity
 *
 * @param factory
 * @param children
 *
 * @constructor
 */
export function ToolGraph({

	factory=RESTGraph,

	children

}: {

	factory?: (fetcher: Fetcher) => Graph

	children: ReactNode

}) {

	const fetcher=useFetcher();

	const value=useMemo(() => factory(fetcher), [factory, fetcher]);


	return createElement(Context.Provider, { value, children });

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useGraph(): Graph {
	return useContext(Context);
}

