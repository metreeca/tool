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

import { immutable, isEmpty } from "@metreeca/core";
import { Entry, Trace }       from "@metreeca/core/entry";
import { errors, Graph }      from "@metreeca/link";


export function RESTGraph(fetcher: typeof fetch=fetch): Graph {

	// !!! TTL / size limits / …

	const cache=new Map<string, Promise<any>>();


	return immutable({

		retrieve<E extends Entry>(model: E): Promise<E> {

			const key=encodeURI(JSON.stringify(model));

			const cached=cache.get(key);

			if ( cached ) {

				return cached;

			} else {

				const id=model.id;
				const query={ ...model, id: undefined };

				const input=isEmpty(query) ? id : `${id}?${(encodeURIComponent(JSON.stringify(query)))}`;

				const controller=new AbortController();

				const promise=fetcher(input, {

					headers: { "Accept": "application/json" },

					signal: controller.signal

				})

					.then(errors)

					.then(response => response.json().catch(error => {

						throw immutable<Trace>({

							status: 400,
							reason: `unreadable JSON payload <${error}>`

						});

					}))

					.catch(error => {

						cache.delete(key);

						throw error;

					});

				cache.set(key, promise);

				return promise;

			}

		},


		create(entry: Entry): Promise<string> {

			const id=entry.id;
			const controller=new AbortController();

			return fetcher(id, {

				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...entry, id: undefined }),

				signal: controller.signal

			})

				.then(errors)

				.then(response => {

					try {

						return response.headers.get("Location") || id;

					} finally {

						cache.clear();

					}

				});
		},

		update(entry: Entry): Promise<string> {

			const id=entry.id;
			const controller=new AbortController();

			return fetcher(id, {

				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...entry, id: undefined }),

				signal: controller.signal

			})

				.then(errors)

				.then(response => {

					try {

						return response.headers.get("Location") || id;

					} finally {

						cache.clear();

					}

				});

		},

		delete(entry: Entry): Promise<string> {

			const id=entry.id;
			const controller=new AbortController();

			return fetcher(id, {

				method: "DELETE",

				signal: controller.signal

			})

				.then(errors)

				.then(response => {

					try {

						return response.headers.get("Location") || id;

					} finally {

						cache.clear();

					}

				});

		}

	});

}