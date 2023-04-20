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

import React from "react";
import { AlertTriangle, Check } from "react-feather";
import { Link, useParams } from "react-router-dom";
import NewsPage from "../../tiles/page";
import NewsSpin from "../../tiles/spin";
import { useGraph } from "../../work/graph";
import { LinkColor, NameColor, NewsBox, NewsBoxEntry, NewsBoxGroup, NewsBoxSection, NoteColor } from "./boxes";


interface Concept {

	id: number;
	name: string;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function dummies({ count=0, disabled=false, unique=false }) {
	return ["Questo", "Quello", "L'Altro", "Quell'Altro Ancora"].map((label, index) => index < count
		&& <NewsBoxEntry key={label} disabled={disabled} unique={unique}><Link to={"."}>{label}</Link></NewsBoxEntry>
	);
}


export default function NewsConcept() {

	const { id }=useParams();

	const [{ name }, { probe }]=useGraph<Concept>(`https://jsonplaceholder.typicode.com/users/${id}`, {

		id: 0,
		name: ""

	});

	return (

		<NewsPage

			name={<><Link to=".">Concepts</Link>{name && <Link to={id}>{name}</Link>}</>}
			menu={<button title="Save"><Check/></button>}
			tool={<Context/>}

		>{probe({

			blank: <NewsSpin/>,
			value: <Properties/>,
			error: <AlertTriangle/>

		})}</NewsPage>

	);

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Context() {
	return <NewsBoxGroup>

		<NewsBox color={LinkColor} title="Upper Concepts" disabled>{dummies({ count: 1, disabled: true })}</NewsBox>
		<NewsBox color={LinkColor} title="Broader Concepts">{dummies({ count: 2 })}</NewsBox>
		<NewsBox color={LinkColor} title="Narrower Concepts">{dummies({ count: 3 })}</NewsBox>

	</NewsBoxGroup>;
}

function Properties() {
	return <>

		<NewsBoxSection>
			<NewsBoxGroup><NewsBox color={NameColor} title="Preferred Label" unique>{dummies({
				count: 1,
				unique: true
			})}</NewsBox></NewsBoxGroup>
			<NewsBoxGroup><NewsBox color={NoteColor} title="Definition" unique>{dummies({
				count: 1,
				unique: true
			})}</NewsBox></NewsBoxGroup>
		</NewsBoxSection>

		<NewsBoxSection>

			<NewsBoxGroup>
				<NewsBox color={NameColor} title="Alt Labels">{dummies({ count: 2 })}</NewsBox>
				<NewsBox color={NameColor} title="Hidden Labels"/>
			</NewsBoxGroup>

			<NewsBoxGroup>
				<NewsBox color={NoteColor} title="Notes">{dummies({ count: 1 })}</NewsBox>
				<NewsBox color={NoteColor} title="Scope Notes"/>
			</NewsBoxGroup>

		</NewsBoxSection>

		<NewsBoxSection>

			<NewsBoxGroup>
				<NewsBox color={NameColor} title="Notations">{dummies({ count: 1 })}</NewsBox>
			</NewsBoxGroup>

			<NewsBoxGroup>
				<NewsBox color={LinkColor} title="Related Concepts">{dummies({ count: 2 })}</NewsBox>
			</NewsBoxGroup>

			<NewsBoxGroup>
				<NewsBox color={LinkColor} title="Exact Matches">{dummies({ count: 1 })}</NewsBox>
			</NewsBoxGroup>

		</NewsBoxSection>

	</>;
}
