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

import static org.junit.Assert.assertEquals;


public final class LinearScaleTest {


	@Test public void testTransformToRange() {

		final int dl=111;
		final int du=2222;

		final int rl=33;
		final int ru=444;

		final LinearScale positiveAbsolute=new LinearScale().domain(NumericScaleTest.series(dl, du, 100));

		assertEquals("lower positive absolute", rl, positiveAbsolute.range(0, rl, ru), 0);
		assertEquals("upper positive absolute", ru, positiveAbsolute.range(du, rl, ru), 0);

		final LinearScale negativeAbsolute=new LinearScale().domain(NumericScaleTest.series(-du, -dl, 100));

		assertEquals("lower negative absolute", ru, negativeAbsolute.range(0, rl, ru), 0);
		assertEquals("upper negative absolute", rl, negativeAbsolute.range(-du, rl, ru), 0);

		final LinearScale mixedAbsolute=new LinearScale().domain(NumericScaleTest.series(-dl, du, 100));

		assertEquals("lower mixed absolute", rl, mixedAbsolute.range(-dl, rl, ru), 0);
		assertEquals("upper mixed absolute", ru, mixedAbsolute.range(du, rl, ru), 0);


		final LinearScale positiveRelative=new LinearScale().relative(true).domain(NumericScaleTest.series(dl, du, 100));

		assertEquals("lower positive relative", rl, positiveRelative.range(dl, rl, ru), 0);
		assertEquals("upper positive relative", ru, positiveRelative.range(du, rl, ru), 0);

		final LinearScale negativeRelative=new LinearScale().relative(true).domain(NumericScaleTest.series(-du, -dl, 100));

		assertEquals("lower negative relative", rl, negativeRelative.range(-du, rl, ru), 0);
		assertEquals("upper negative relative", ru, negativeRelative.range(-dl, rl, ru), 0);

		final LinearScale mixedRelative=new LinearScale().relative(true).domain(NumericScaleTest.series(-dl, du, 100));

		assertEquals("lower mixed relative", rl, mixedRelative.range(-dl, rl, ru), 0);
		assertEquals("upper mixed relative", ru, mixedRelative.range(du, rl, ru), 0);
	}

	@Test public void testTransformToDomain() {

		final int dl=111;
		final int du=2222;

		final int rl=33;
		final int ru=444;

		final LinearScale positiveAbsolute=new LinearScale().domain(NumericScaleTest.series(dl, du, 100));

		assertEquals("lower positive absolute", 0, positiveAbsolute.domain(rl, rl, ru), 0);
		assertEquals("upper positive absolute", du, positiveAbsolute.domain(ru, rl, ru), 0);

		final LinearScale negativeAbsolute=new LinearScale().domain(NumericScaleTest.series(-du, -dl, 100));

		assertEquals("lower negative absolute", -du, negativeAbsolute.domain(rl, rl, ru), 0);
		assertEquals("upper negative absolute", 0, negativeAbsolute.domain(ru, rl, ru), 0);

		final LinearScale mixedAbsolute=new LinearScale().domain(NumericScaleTest.series(-dl, du, 100));

		assertEquals("lower mixed absolute", -dl, mixedAbsolute.domain(rl, rl, ru), 0);
		assertEquals("upper mixed absolute", du, mixedAbsolute.domain(ru, rl, ru), 0);


		final LinearScale positiveRelative=new LinearScale().relative(true).domain(NumericScaleTest.series(dl, du, 100));

		assertEquals("lower positive relative", dl, positiveRelative.domain(rl, rl, ru), 0);
		assertEquals("upper positive relative", du, positiveRelative.domain(ru, rl, ru), 0);

		final LinearScale negativeRelative=new LinearScale().relative(true).domain(NumericScaleTest.series(-du, -dl, 100));

		assertEquals("lower negative relative", -du, negativeRelative.domain(rl, rl, ru), 0);
		assertEquals("upper negative relative", -dl, negativeRelative.domain(ru, rl, ru), 0);

		final LinearScale mixedRelative=new LinearScale().relative(true).domain(NumericScaleTest.series(-dl, du, 100));

		assertEquals("lower mixed relative", -dl, mixedRelative.domain(rl, rl, ru), 0);
		assertEquals("upper mixed relative", du, mixedRelative.domain(ru, rl, ru), 0);

	}

}
