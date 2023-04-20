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

import { isString } from "@metreeca/core/string";
import { createContext, createElement, ReactNode, useContext } from "react";


export type Fetcher=(typeof fetch) & {

	intercept(interceptor: Interceptor): Fetcher

	observe(observer: Observer): () => void

};


export type Interceptor={

	(delegate: typeof fetch): typeof fetch

}

export type Observer={

	(active: boolean): void

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Fetcher context.
 *
 * Provides nested components with a {@link useFetcher| head}-based shared state containing:
 *
 * - a shared fetch service
 * - a network activity status flag
 *
 * @module
 */
const Context=createContext<Fetcher>(std());


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The internal status code used for reporting fetch aborts as synthetic responses.
 */
export const FetchAborted=499;

/**
 * The internal status code used for reporting fetch errors as synthetic responses.
 */
export const FetchFailed=599;

/**
 * The set of safe HTTP methods.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP| MDN - Safe (HTTP Methods)}
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7231#section-4.2.1| RFC 7231 - Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content - § 4.2.1. Safe Methods }
 */
export const Safe: Set<String>=new Set<String>(["GET", "HEAD", "OPTIONS", "TRACE"]);


/**
 * Resolves a URL.
 *
 * @param path the possibly relative URL to be resolved
 * @param base the base URL `path` is to be resolved against; defaults to {@link location.href}
 *
 * @returns a URL obtained by resolving `path` against `base`
 */
export function resolve(path: string, base: string=location.href): string {
	return new URL(path, base).href;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a fetcher context.
 *
 * **Warning** / The `fetcher` argument must have a stable identity.
 *
 * @param fetcher the fetch function to be exposed by the new context; defaults to the global {@link fetch} function
 * @param children the children components to be nested inside the new context component
 *
 * @return a new fetcher context component
 *
 */
export function ToolFetcher({

	fetcher=std(),

	children

}: {

	fetcher?: Fetcher

	children: ReactNode

}) {

	return createElement(Context.Provider, { value: fetcher, children });

}

/**
 * Creates a fetcher context hook.
 */
export function useFetcher(): Fetcher {
	return useContext(Context);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a fetcher extended with standard services.
 *
 * - injection of angular-compatible XSRF protection header
 * - conversion of network errors to synthetic HTTP status codes
 *
 * @return a wrapped version of `fetcher` supporting standard services
 */ function std(): Fetcher {

	let pending=0;

	const observers: Set<Observer>=new Set<Observer>();


	function notify(active: boolean) {

		observers.forEach(observer => observer(active));

	}

	function fetcher(delegate: typeof fetch, observable: (observer: Observer) => (() => void)): Fetcher {

		return /*immutable*/(Object.assign(delegate, {

			intercept: (interceptor: Interceptor) => fetcher(interceptor(delegate), observable),

			observe: observable

		}));

	}


	return fetcher((input: URL | RequestInfo, init: RequestInit={}) => {

		const method=(init.method || "GET").toUpperCase();
		const origin=new URL(isString(input) ? input : input instanceof URL ? input : input.url, location.href).origin;
		const headers=new Headers(init.headers || {});


		// default Accept header

		if ( !headers.get("Accept") ) {
			headers.set("Accept", "application/json");
		}

		// angular-compatible XSRF protection header

		if ( !Safe.has(method.toUpperCase()) && origin === location.origin ) {

			let xsrf=(document.cookie.match(/\bXSRF-TOKEN\s*=\s*"?([^\s,;\\"]*)"?/) || [])[1];

			if ( xsrf ) { headers.append("X-XSRF-TOKEN", xsrf); }

		}

		try {

			return fetch(input, { ...init, headers })

				// error to synthetic response conversion

				.catch(reason => {

					return new Response(null, reason.name === "AbortError"
						? { status: FetchAborted, statusText: "Network Request Aborted" }
						: { status: FetchFailed, statusText: "Network Request Failed" }
					);

				})

				.finally(() => {

					if ( --pending === 0 ) { notify(false); }

				});

		} finally {

			if ( pending++ === 0 ) { notify(true); }

		}

	}, observer => {

		observers.add(observer);

		return () => observers.delete(observer);

	});

}

