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

import { useFetcher } from "@metreeca/data/contexts/fetcher";
import { useEffect, useState } from "react";


export interface Asset {

	readonly code?: number;
	readonly text?: string;
	readonly hash?: string;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useAsset(file: undefined | string): Asset {

	const url=file ? new URL(file, location.href) : new URL(location.href);

	const path=url?.pathname;
	const type=".md"; // !!! generalize
	const hash=url?.hash.substring(1);


	const fetcher=useFetcher();
	const [asset, setAsset]=useState<Asset>({});


	useEffect(() => {

		if ( path ) {

			const asset=path.endsWith(type) ? path
				: path.endsWith("/") ? `${path}index${type}`
					: `${path}${type}`;

			const controller=new AbortController();

			fetcher(asset, { signal: controller.signal })

				.then(response => response.text().then(text => {

					setAsset({
						code: response.status,
						text,
						hash
					});

				}));

			return () => controller.abort();

		} else {

			return () => {};

		}

	}, [path]);


	return asset;
}