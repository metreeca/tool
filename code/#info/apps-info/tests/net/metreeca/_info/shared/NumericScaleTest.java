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

import org.junit.Test;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;


public final class NumericScaleTest {


	@Test public void testComputeExtrema() {

		final NumericScale<?> scale=scale().domain(series(1, 2, 100));

		assertEquals("minimum", 1, scale.minimum(), 0);
		assertEquals("maximum", 2, scale.maximum(), 0);
	}

	@Test public void testComputeScale() {

		final NumericScale<?> scale=scale().domain(series(111, 2222, 100));

		assertEquals("major scale", 1000, scale.major(), 0);
		assertEquals("minor scale", 100, scale.minor(), 0);
	}

	@Test public void testAdaptDomain() {

		final NumericScale<?> scale=scale().domain(series(111, 2222, 100));

		assertEquals("lower", 100, scale.lower(), 0);
		assertEquals("upper", 2300, scale.upper(), 0);

		final NumericScale<?> padding=scale().domain(series(100, 2300, 100));

		assertEquals("padded lower", 0, padding.lower(), 0);
		assertEquals("padded upper", 2400, padding.upper(), 0);
	}


	@Test public void testGenerateTicks() {

		final NumericScale<?> scale=scale().adapted(false).domain(series(10, 30, 100));

		assertArrayEquals("empty", new float[] {}, scale.relative(false).ticks(0), 0);

		assertArrayEquals("absolute singleton", new float[] {0}, scale.relative(false).ticks(1), 0);
		assertArrayEquals("relative singleton", new float[] {10}, scale.relative(true).ticks(1), 0);

		assertArrayEquals("absolute", new float[] {0, 10, 20, 30}, scale.relative(false).ticks(4), 0);
		assertArrayEquals("relative", new float[] {10, 20, 30}, scale.relative(true).ticks(3), 0);
	}


	//// Harness ///////////////////////////////////////////////////////////////////////////////////////////////////////

	private static NumericScale<?> scale() {
		return new NumericScale() {

			@Override protected NumericScale<?> self() {
				return this;
			}

			@Override public float range(final float d, final float rl, final float ru) {
				return 0;
			}

			@Override public float domain(final float r, final float rl, final float ru) {
				return 0;
			}
		};
	}

	public static Series series(final float lower, final float upper, final int steps) {

		final float[] numbers=new float[steps];

		for (int i=0; i < steps; ++i) {
			numbers[i]=i*(upper-lower)/(steps-1)+lower;
		}

		return new Series() {

			@Override public int length() {
				return numbers.length;
			}

			@Override public String string(final int index) {
				return "";
			}

			@Override public float number(final int index) {
				return index >= 0 && index < numbers.length ? numbers[index] : Float.NaN;
			}

			@Override public long time(final int index) {
				return -1;
			}
		};
	}

}
