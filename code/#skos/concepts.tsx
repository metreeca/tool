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
import { AlertTriangle, DownloadCloud, Plus } from "react-feather";
import { Link } from "react-router-dom";
import NewsPage from "../../tiles/page";
import NewsSpin from "../../tiles/spin";
import { useGraph } from "../../work/graph";
import { LinkColor, NewsBox, NewsBoxEntry } from "./boxes";


interface Concept {

	id: number;
	name: string;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function NewsConcepts() {

	const [concepts, { probe }]=useGraph<Concept[]>("https://jsonplaceholder.typicode.com/users/", [{

		id: 0,
		name: ""

	}]);

	return ( // !!! review status reporting (delay, status/reason, …)

		<NewsPage
			name={<Link to=".">Concepts</Link>}
			menu={<>
				<button><DownloadCloud/></button>
				<button><Plus/></button>
			</>}
			tool={TopConcepts(concepts)}
		>

			<div>{probe({

				blank: <NewsSpin/>,
				value: <AlertTriangle/>,
				error: <AlertTriangle/>

			})}</div>

		</NewsPage>
	);

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function TopConcepts(concepts: Concept[]) {
	return (
		<NewsBox color={LinkColor} title="Top Concepts" disabled>{concepts.map(concept =>
			<NewsBoxEntry key={concept.id} disabled><Link to={String(concept.id)}>{concept.name}</Link></NewsBoxEntry>
		)}</NewsBox>
	);
}

