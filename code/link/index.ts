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

import { immutable } from "@metreeca/core";
import { Entry } from "@metreeca/core/entry";
import { Value } from "@metreeca/core/value";


export interface Graph {

	observe(observer: (id: string) => void): () => void;


	retrieve<E extends Entry>(model: E): Promise<E>;


	create(entry: Entry): Promise<string>;

	update(entry: Entry): Promise<string>;

	delete(entry: Entry): Promise<string>;

}

/**
 * Error trace.
 */
export interface Trace {

	readonly status: number;
	readonly reason: string;

	readonly detail?: Value;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function errors(response: Response): Promise<Response> {
	if ( response.ok ) {

		return Promise.resolve(response);

	} else {

		const mime=response.headers.get("Content-Type");

		if ( mime?.match(/^text\/plain\b/i) ) {

			return response.text()

				.catch(error => {

					throw immutable<Trace>({

						status: 400,
						reason: `unreadable text payload <${error}>`

					});

				})

				.then(value => {

					throw immutable<Trace>({

						status: response.status,
						reason: response.statusText,

						detail: value

					});

				});

		} else if ( mime?.match(/^application\/(ld\+)?json\b/i) ) {

			return response.json()

				.catch(error => {

					throw immutable<Trace>({

						status: 400,
						reason: `unreadable JSON payload <${error}>`

					});

				})

				.then(value => {

					throw immutable<Trace>({

						status: response.status,
						reason: response.statusText,

						detail: value

					});

				});

		} else {

			throw immutable<Trace>({

				status: response.status,
				reason: response.statusText

			});

		}

	}
}
