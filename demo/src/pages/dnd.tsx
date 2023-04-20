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

import * as React from "react";
import { createElement, useState } from "react";
import "./dnd.css";
import { DemoPage } from "@metreeca/demo/views/page";
import { immutable } from "@metreeca/core";

// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

export function draggable<E extends Element>({}: {}) {

	return {

		draggable: true,

		onDragStart: (e: React.DragEvent<E>) => {

			e.currentTarget.classList.add("dragging");

			// const image=document.createElement("span");
			//
			// image.textContent=e.currentTarget.textContent;
			//
			// e.dataTransfer.setDragImage(image, 10, 10);

		},

		onDrag: (e: React.DragEvent<E>) => {},

		onDragEnd: (e: React.DragEvent<E>) => {
			e.currentTarget.classList.remove("dragging");
		}

	};

}

export function droppable<E extends Element>({}: {}) {
	return {

		onDragEnter: (e: React.DragEvent<E>) => {
			e.currentTarget.classList.add("dropping");
		},

		onDragOver: (e: React.DragEvent<E>) => {},

		onDragLeave: (e: React.DragEvent<E>) => {
			e.currentTarget.classList.remove("dropping");
		},

		onDrop: (e: React.DragEvent<E>) => {}

	};
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export const DND=immutable({

	id: "/dnd",
	label: "DND"

});

export function DemoDND() {

	const [items, setItems]=useState(["uno", "due", "tre"]);
	const [cache, setCache]=useState(items);

	return <DemoPage>

		{createElement("demo-dnd", {}, <ul {...droppable({})}>{cache.map(item =>

			<li key={item} {...draggable({})}>{item}</li>
		)}</ul>)}

	</DemoPage>;

}

