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
import net.metreeca._info.shared.Series;
import net.metreeca.tile.client.Action;
import net.metreeca.tile.client.Event;

import com.google.gwt.core.client.GWT;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.TextResource;

import static net.metreeca._info.client.SVG.Path;
import static net.metreeca._info.client.SVG.path;
import static net.metreeca._info.client.SVG.svg;
import static net.metreeca.tile.client.Tile.$;


public final class Sparkline extends Chart {

	private static final Resources resources=GWT.create(Resources.class);


	public static interface Resources extends ClientBundle {

		@Source("Sparkline.css") TextResource skin();

	}


	private Series values;


	public Sparkline() {
		root("<div/>").skin(resources.skin().getText());
	}


	public Sparkline values(final Series values) {

		if ( values == null ) {
			throw new IllegalArgumentException("null values");
		}

		this.values=values;

		root().async(new Action<Event>() { // !!! merge multiple calls
			@Override public void execute(final Event e) { render(); }
		});

		return this;
	}


	private Sparkline render() {

		final float width=root().width();
		final float height=root().height();

		final Path path=path();
		final int length=values.length();

		if ( length > 0 ) {

			final LinearScale vertical=new LinearScale().domain(values).relative(true);
			final LinearScale horizontal=new LinearScale().domain(0, length);

			path.Move(horizontal.range(0, 0, width), height-vertical.range(values.number(0), 0, height));

			for (int i=1; i < length; ++i) {
				path.Line(horizontal.range(i, 0, width), height-vertical.range(values.number(i), 0, height));
			}
		}

		root().clear().append($(svg(width, height)).append($(path).is("data", true)));

		return this;
	}
}
