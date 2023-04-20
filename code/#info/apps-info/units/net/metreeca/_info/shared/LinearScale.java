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

package net.metreeca._info.shared;


public final class LinearScale extends NumericScale<LinearScale> {

	@Override protected LinearScale self() {
		return this;
	}


	@Override public float range(final float d, final float rl, final float ru) {

		final float dl=dl();
		final float du=du();

		return dl < du ? (d-dl)*(ru-rl)/(du-dl)+rl : rl;
	}

	@Override public float domain(final float r, final float rl, final float ru) {

		final float dl=dl();
		final float du=du();

		return rl < ru ? (r-rl)*(du-dl)/(ru-rl)+dl : dl;
	}

}
