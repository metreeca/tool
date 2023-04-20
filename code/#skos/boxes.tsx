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

import { css } from "emotion";
import React, { ReactNode } from "react";
import { ChevronRight, Edit3, Plus, X } from "react-feather";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// export const LinkColor=`hsl(240, 30%, 85%)`;
// export const NameColor=`hsl(180, 30%, 83%)`;
// export const NoteColor=`hsl(120, 30%, 84%)`;

export const LinkColor=`hsl(210, 30%, 80%)`;
export const NameColor=`hsl(175, 30%, 80%)`;
export const NoteColor=`hsl(140, 30%, 80%)`;

export function NewsBox({

	unique=false,
	disabled=false,

	title="",
	color="",

	children=(null as ReactNode)

}) {
	return (
		<div className={css`& {

			min-width: 12rem; // < side width
			max-width: 50rem;
				
			display: flex;
			flex-direction: column;
			align-items: stretch;
			
			padding: 0.25em 0;
			border-radius: 0.5em;
			background-color: var(--news--background-color);

			> div {
			
				display: flex;
				flex-direction: row;
				align-items: center;
				
				padding: 0.1em 0.3em;
				background-color: transparent;
				
				> * {
					border: none;
				}
				
				> button {
				
					flex: 0 0 auto;
					margin-right: 0.5em;
					color: #FFF;

					> svg {
						position: relative;
						top: 1px;
						width: 15px;
						height: 15px;
						stroke-width: 4px;
						filter: drop-shadow(0 0 1px #CCC);
					}
					
				}
									
				> :not(button) {
					flex: 1 1 auto
				}
				
				> strong {
					color: #FFF;
					text-shadow: 0 0 1px #CCC;
				}
	
			}
						
			> div:first-child:not(:only-child) {
				padding-bottom: 0.4em;
				margin-bottom: 0.25em;
				border-bottom: solid 2px #FFF;
			}
						
			> div:last-child {
				padding-bottom: 0.25em;
			}

		}`} style={{ // @ts-ignore
			"--news--background-color": color
		}}>

			<div>
				<button>{unique || disabled ? <ChevronRight/> : <Plus/>}</button>
				<strong>{title}</strong>
			</div>

			{children}

		</div>
	);
}

export function NewsBoxEntry({

	disabled=false, // !!! inherit from Box
	unique=false, // !!! inherit from Box

	children=(null as ReactNode)

}) {
	return <div>

		<button>{disabled ? <ChevronRight/> : unique ? <Edit3 style={{ strokeWidth: 3 }}/> : <X/>}</button>

		{children}

	</div>;
}

export function NewsBoxGroup({ children }: { children: ReactNode | ReactNode[] }) {
	return <div className={css`& {
	
		> *+* {
			margin-top: 0.75em;
		}
		 
	}`}>

		{children}

	</div>;
}

export function NewsBoxSection({ children }: { children: ReactNode[] }) {
	return <section className={css`& {

		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: start;
		
		margin: -0.75em 0 0 -0.75em; // ;(safari) gap hack // gap: 0.75em;

		:not(:first-child) {
			margin-top: 1em;
		}
		
		> * {
			flex: 1 1 0;
			margin: 0.75em 0 0 0.75em; // ;(safari) gap hack
		}
		
		> :nth-child(2):last-child {
			flex: 2 1 1.25em;
		}
		
	}`}>

		{children}

	</section>;
}
