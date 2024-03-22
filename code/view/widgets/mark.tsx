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

import { asObject, isFunction } from "@metreeca/core";
import { isString } from "@metreeca/core/string";
import { Asset } from "@metreeca/data/hooks/asset";
import { ToolHint } from "@metreeca/view/widgets/hint";
import { ErrorIcon, ForbiddenIcon, NotFoundIcon, UnauthorizedIcon } from "@metreeca/view/widgets/icon";
import { ToolSpin } from "@metreeca/view/widgets/spin";
import Slugger from "github-slugger";
import { Root } from "hast";
import { headingRank } from "hast-util-heading-rank";
import { toString } from "hast-util-to-string";
import "highlight.js/styles/github.css";
import React, { ReactNode, useEffect } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import { Nodes } from "react-markdown/lib";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import { find } from "unist-util-find";


export interface Meta {

	readonly [label: string]: string;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a Markdown rendering component.
 *
 * @param children either markdown content or an absolute or root-relative URL the Markdown content is to be retrieved
 *     from
 */
export function ToolMark({

	meta,

	children

}: {

	meta?: "toc" | string | ((meta: Meta) => ReactNode)

	children: string | Asset

}) {

	const { code, text, hash }: Asset=isString(children) ? { code: 200, text: children } : children;

	useEffect(() => {

		if ( hash ) {
			document.getElementById(hash)?.scrollIntoView(); // scroll to anchor
		}

	}, [hash]);

	return meta === "toc" ? text && ToolMarkTOC(text)

		: meta ? text && ToolMarkMeta(text, meta)

			: isString(text) ? text && ToolMarkText(text)

				: <ToolHint>{{

					0: <ToolSpin/>,

					401: <><UnauthorizedIcon/><span>Restricted Document<br/>Log In to Access</span></>,
					403: <><ForbiddenIcon/><span>Restricted Document</span></>,
					404: <><NotFoundIcon/><span>Document Not Found</span></>

				}[code ?? 0] ?? <><ErrorIcon/><span>Unable to Download</span></>}</ToolHint>;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ToolMarkTOC(text: string) {
	return text && <ReactMarkdown

        remarkPlugins={[remarkFrontmatter]}

        rehypePlugins={[function () {
			return (root: Root) => {

				const slugs=new Slugger();

				slugs.reset();

				return {

					...root, children: (root.children).filter((node) => headingRank(node)).map(node => ({
						...node, children: [{
							...node,
							type: "element",
							tagName: "a",
							properties: { href: `#${slugs.slug(toString(node))}` }
						}]
					}))

				};

			};
		}]}

    >{

		text

	}</ReactMarkdown>;
}

function ToolMarkMeta(text: string, meta: string | ((meta: Meta) => ReactNode)) {

	const file=remark()

		.use(remarkFrontmatter)

		.use(() => (tree: Nodes, file) => {

			const node=find(tree, { type: "yaml" });

			if ( node && "value" in node && isString(node.value) ) {

				const matches=[...node.value.matchAll(/(?:^|\n)\s*(\w+)\s*:\s*(.*?)\s*(?:\n|$)/g)];

				file.data.meta=matches.reduce((entries, [$0, $1, $2]) => ({ ...entries, [$1]: $2 }), {});

			}

		})

		.processSync(text);

	const entries=asObject(file.data.meta) ?? {};

	return isFunction(meta) ? meta(entries)
		: entries[meta] ? <span>{entries[meta]}</span>
			: null;
}

function ToolMarkText(content: string) {
	return <ReactMarkdown

		remarkPlugins={[remarkFrontmatter, remarkGfm, remarkGemoji]}
		rehypePlugins={[rehypeSlug, rehypeHighlight]}

		urlTransform={href => [defaultUrlTransform(href)]
			.map(value => value.endsWith("/index.md") ? value.substring(0, value.length - "/index.md".length) : value)
			.map(value => value.endsWith(".md") ? value.substring(0, value.length - ".md".length) : value)
			[0]
		}

	>{

		content

	}</ReactMarkdown>;
}
