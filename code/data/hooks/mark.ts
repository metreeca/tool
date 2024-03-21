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

import { isString } from "@metreeca/core/string";
import { FetchAborted, FetchFailed } from "@metreeca/data/contexts/fetcher";
import { useEffect, useState } from "react";


export interface Mark {

	readonly code?: number;
	readonly text?: string;
	readonly hash?: string;

}

export interface Meta {

	readonly [label: string]: string;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function useMark(file: undefined | string): Mark {

	const [mark, setMark]=useState<Mark>({});


	const url=isString(file) ? new URL(file || location.href) : undefined;

	const path=url?.pathname;
	const hash=url?.hash.substring(1);


	useEffect(() => {

		if ( path ) {

			const asset=path.endsWith(".md") ? path
				: path.endsWith("/") ? `${path}index.md`
					: `${path}.md`;

			const controller=new AbortController();

			fetch(asset, { signal: controller.signal })

				.then(response => response.text().then(text => {

					setMark({
						code: response.status,
						text,
						hash
					});

				}))

				.catch(reason => {

					setMark({
						code: reason.name === "AbortError" ? FetchAborted : FetchFailed
					});

				});

			return () => controller.abort();

		} else {

			return () => {};

		}

	}, [path]);


	return mark;
}