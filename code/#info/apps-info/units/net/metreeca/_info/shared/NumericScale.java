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

import net.metreeca._info.client.Formatter;


public abstract class NumericScale<T extends NumericScale<T>> {

	private static final Formatter formatter=new Formatter();


	private boolean adapted;
	private boolean relative;

	private float minimum=Float.NaN;
	private float maximum=Float.NaN;

	private float lower=Float.NaN;
	private float upper=Float.NaN;

	private float major=1;
	private float minor=1;


	protected abstract T self();


	protected float dl() {
		return dl(adapted);
	}

	protected float du() {
		return du(adapted);
	}


	protected float dl(final boolean adapted) {
		return adapted ? relative ? lower : Math.min(0, lower) : relative ? minimum : Math.min(0, minimum);
	}

	protected float du(final boolean adapted) {
		return adapted ? relative ? upper : Math.max(0, upper) : relative ? maximum : Math.max(0, maximum);
	}


	public boolean adapted() {
		return adapted;
	}

	public T adapted(final boolean adapted) {

		this.adapted=adapted;

		return self();
	}


	public boolean relative() {

		return relative;

	}

	public T relative(final boolean relative) {

		this.relative=relative;

		return self();
	}


	public float minimum() {
		return minimum;
	}

	public float maximum() {
		return maximum;
	}


	public float lower() {
		return lower;
	}

	public float upper() {
		return upper;
	}


	public float major() {
		return major;
	}

	public float minor() {
		return minor;
	}


	public T domain(final Series series) {

		if ( series == null ) {
			throw new IllegalArgumentException("null series");
		}

		float minimum=Float.NaN;
		float maximum=Float.NaN;

		for (int i=0, length=series.length(); i < length; ++i) {

			final float value=series.number(i);

			minimum=Float.isNaN(value) ? minimum : Float.isNaN(minimum) ? value : Math.min(minimum, value);
			maximum=Float.isNaN(value) ? maximum : Float.isNaN(maximum) ? value : Math.max(maximum, value);
		}

		return domain(minimum, maximum);
	}

	public T domain(final float minimum, final float maximum) {

		if ( minimum > maximum ) {
			throw new IllegalArgumentException("illegal domain ["+minimum+", "+maximum+"]");
		}

		this.maximum=maximum;
		this.minimum=minimum;

		major=maximum > minimum ? (float)Math.pow(10, Math.floor(Math.log10(maximum-minimum))) : 1;
		minor=major/10;

		lower=(float)(minimum == 0 ? 0 : Math.min(Math.floor(minimum/minor), Math.ceil(minimum/minor)-1)*minor);
		upper=(float)(maximum == 0 ? 0 : Math.max(Math.ceil(maximum/minor), Math.floor(maximum/minor)+1)*minor);

		return self();
	}


	public abstract float range(float d, float rl, float ru);

	public abstract float domain(float r, float rl, float ru);


	public float[] ticks() {

		final float dl=dl(true);
		final float du=du(true);

		final int count=5;

		final float step=(float)(Math.floor((du-dl)/count/minor)*minor);

		final float[] ticks=new float[count+1];

		for (int i=0; i < ticks.length; ++i) {
			ticks[i]=i*step+dl;
		}

		return ticks;
	}

	public float[] ticks(final int count) {

		if ( count < 0 ) {
			throw new IllegalArgumentException("illegal count ["+count+"]");
		}

		final float[] ticks=new float[count];

		final float dl=dl();
		final float du=du();

		final float step=count > 1 ? (du-dl)/(count-1) : 0;

		for (int i=0; i < ticks.length; ++i) {
			ticks[i]=i*step+dl;
		}

		return ticks;
	}


	public String format(final float value) { return formatter.technical(value); }

	public String technical(final float value) { return formatter.technical(value); }

	public String scientific(final float value) { return formatter.scientific(value); }

	public String decimal(final float value) { return formatter.decimal(value); }
}
