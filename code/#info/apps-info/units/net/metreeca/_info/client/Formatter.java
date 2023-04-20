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

package net.metreeca._info.client;

import com.google.gwt.i18n.client.NumberFormat;


public final class Formatter { // !!! factor with LinearScale

	public String format(final float value) {
		return Math.abs(value) < 1.0e9 ? decimal(value) : scientific(value);
	}

	public String scientific(final float value) {
		return NumberFormat.getScientificFormat().format(value);
	}

	public String decimal(final float value) {
		return NumberFormat.getDecimalFormat().format(value);
	}

	public String technical(final float value) {

		final double order=Math.floor(Math.floor(value == 0 ? 1 : Math.log10(Math.abs(value)))/3)*3;
		final double scale=Math.pow(10, order);

		final String[] exponents={
				"", "k", "M", "G", "T"
		}; // !!! negative exponents // !!! handle out of scale exponents

		final double yyy=Math.round(value*10/scale)/10.0;

		final String exponent=exponents[((int)order/3)];

		return exponent.isEmpty() ? String.valueOf(yyy) : yyy+" "+exponent;
	}

}
