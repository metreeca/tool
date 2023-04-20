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

package net.metreeca._info.client.charts;

import net.metreeca._info.client.Chart;
import net.metreeca._info.shared.LinearScale;
import net.metreeca.tile.client.Action;
import net.metreeca.tile.client.Event;
import net.metreeca.tile.client.Tile;

import java.util.Arrays;
import java.util.List;

import com.google.gwt.core.client.GWT;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.TextResource;

import static net.metreeca._info.client.SVG.line;
import static net.metreeca._info.client.SVG.rect;
import static net.metreeca._info.client.SVG.svg;
import static net.metreeca.tile.client.Tile.$;


public final class Bullet extends Chart {

	private static final float[] None={};

	private static final Resources resources=GWT.create(Resources.class);


	public static interface Resources extends ClientBundle {

		@Source("Bullet.css") TextResource skin();

	}


	private float actual=Float.NaN;
	private float target=Float.NaN;

	private float[] lower=None;
	private float[] upper=None;


	public Bullet() {
		root().skin(resources.skin().getText());
	}


	public Bullet actual(final float actual) {

		this.actual=actual;

		return schedule();
	}

	public Bullet ranges(final List<Float> ranges) {

		if ( ranges == null ) {
			throw new IllegalArgumentException("null ranges");
		}

		if ( ranges.size() < 1 ) {
			throw new IllegalArgumentException("illegal ranges ["+ranges+"]");
		}

		if ( ranges.size() == 1 ) {

			return ranges.get(0) > 0 ? ranges(Arrays.asList(0.0f, ranges.get(0), 2*ranges.get(0)))
					: ranges.get(0) < 0 ? ranges(Arrays.asList(2*ranges.get(0), ranges.get(0), 0.0f))
					: ranges(Arrays.asList(0.0f, 0.0f, 1.0f));

		} else {

			// !!! test ranges (Nans?)

			final int size=ranges.size()/2;

			this.target=(ranges.size()%2 == 0) ? Float.NaN : ranges.get(size);

			this.lower=new float[size];
			this.upper=new float[size];

			for (int i=0; i < size; ++i) {
				lower[i]=ranges.get(i);
				upper[i]=ranges.get(ranges.size()-i-1);
			}

			return schedule();
		}
	}


	//// View //////////////////////////////////////////////////////////////////////////////////////////////////////////

	private void render() {

		final float width=root().width();
		final float height=root().height();

		root().clear();

		if ( target > 0 ) {

			final LinearScale horizontal=new LinearScale().domain(lower[0], upper[0]).relative(true);

			final int steps=Math.min(lower.length, 5);

			final Tile svg=$(svg(width, height));

			for (int i=0; i < steps; ++i) {

				final float lower=horizontal.range(this.lower[i], 0, width);
				final float upper=horizontal.range(this.upper[i], 0, width);

				svg.append($(rect(lower, 0, upper-lower, height)).is("s"+steps+" _"+i, true));
			}

			final float actual=horizontal.range(this.actual, 0, width);
			final float target=horizontal.range(this.target, 0, width);

			root().append(svg

					// !! swap axis if < 0
					// !!! as blob if lower[0] != 0

					.append($(rect(0, height/3.0f, actual, height/3.0f)).is("value", true))

					.append($(line(target, 0, target, height)).is("target", true)));
		}
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	private Action<Event> render;

	private Bullet schedule() {

		if ( render == null ) {
			root().async(render=new Action<Event>() {
				@Override public void execute(final Event e) { try { render(); } finally { render=null; } }
			});
		}

		return this;
	}
}
