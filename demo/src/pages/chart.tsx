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

import * as d3 from "_d3";
import * as React from "react";
import { createElement, useEffect, useState } from "react";
import { useD3 } from "@metreeca/#info/_d3";
import "./chart.css";


function random() {
	return Array(100).fill(0).map(() => ({

		x: Math.random(),
		y: Math.random()

	}));
}


export function WorkTool() {

	const [points, setPoint]=useState(random());


	useEffect(() => {

		const interval=setInterval(() => setPoint(random()), 1000);

		return () => clearInterval(interval);

	});


	return createElement("work-tool", {}, <WorkChart points={points}/>);

}

export interface Point {

	readonly x: number;
	readonly y: number;

}

export function WorkChart({ points }: { points: Point[] }) {

	const svg=useD3(function (node: SVGSVGElement): void {

		const box=node.getBoundingClientRect();


		const x=d3.scaleLinear()
			.domain([0, 1])
			.range([0, box.width]);

		const y=d3.scaleLinear()
			.domain([0, 1])
			.range([0, box.height]);


		const dots=d3.select(node)
			.selectAll("circle")
			.data(points);

		dots.enter()

			.append("circle")
			.attr("cx", point => x(point.x))
			.attr("cy", point => y(point.y))
			.attr("r", 3)
			.style("fill", "red");

		dots.exit()
			.remove();

		dots.transition().duration(1000)
			.ease(d3.easeLinear)
			.attr("cx", point => x(point.x))
			.attr("cy", point => y(point.y));

	}, [points]);

	return createElement("work-chart", {}, <svg ref={svg}/>);

}