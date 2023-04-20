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

import { isEmpty } from "@metreeca/core";
import { Value } from "@metreeca/core/value";
import { useCache } from "@metreeca/data/hooks/cache";
import { Collection } from "@metreeca/data/models/collection";


export type Stats=Readonly<[

		undefined | Readonly<{

		filtered: boolean

		count: number;

	}>,

	() => void

]>


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useStats<

	T extends Value

>([{ query, items }, setCollection]: Collection<T>, {

	//

}: Partial<{

	//

}>={}): Stats {

	const results=items({

		...query,

		count: undefined,

		["count=count:"]: 0

	});

	const [count]=useCache(results?.[0]?.count);


	return [

		{

			filtered: !isEmpty(query),

			count: count ?? 0

		},

		() => setCollection()

	];

}