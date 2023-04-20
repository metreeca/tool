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

public final class TimeScaleTest {

	private static final long Second=1000L;
	private static final long Minute=60*Second;
	private static final long Hour=60*Minute;
	private static final long Day=24*Hour;
	private static final long Week=7*Day;
	private static final long Month=30*Day;
	private static final long Quarter=91*Day;
	private static final long Year=365*Day;
	private static final long Century=100*Year;
	private static final long Millennium=1000*Year;


	//// Harness ///////////////////////////////////////////////////////////////////////////////////////////////////////

	private Series series(final int length, final long unit) {

		final long[] times=new long[length];

		for (int i=0; i < times.length; ++i) {
			times[i]=i*unit;
		}

		return new Series() {

			@Override public int length() {
				return times.length;
			}

			@Override public String string(final int index) {
				return "";
			}

			@Override public float number(final int index) {
				return Float.NaN;
			}

			@Override public long time(final int index) {
				return index >= 0 && index < times.length ? times[index] : -1;
			}
		};
	}

}
