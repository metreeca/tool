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

import net.metreeca._info.shared.NumericScale;
import net.metreeca.tile.client.Action;
import net.metreeca.tile.client.Event;
import net.metreeca.tile.client.View;

import com.google.gwt.core.client.GWT;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.TextResource;

import static net.metreeca._info.client.SVG.*;
import static net.metreeca.tile.client.Tile.$;
import static net.metreeca.tile.client.View.Orientation.Horizontal;
import static net.metreeca.tile.client.View.Orientation.Vertical;


public final class Axis extends View {

	public static final int TickSize=4; // !!! adapt to canvas size

	private static final Resources resources=GWT.create(Resources.class);


	public static interface Resources extends ClientBundle {

		@Source("Axis.css") TextResource skin();

	}


	private Orientation type;

	private boolean base;
	private boolean label;
	private boolean values;
	private boolean ticks;
	private boolean grid;

	private NumericScale<?> scale;

	private float width;
	private float height;


	public Axis() {
		root($(group())).skin(resources.skin().getText());
	}


	public Axis type(final Orientation type) {

		if ( type == null ) {
			throw new IllegalArgumentException("null type");
		}

		this.type=type;

		return render();
	}


	public Axis label(final boolean label) {

		this.label=label;

		return render();
	}

	public Axis base(final boolean base) {

		this.base=base;

		return render();
	}

	public Axis values(final boolean values) {

		this.values=values;

		return render();
	}

	public Axis ticks(final boolean ticks) {

		this.ticks=ticks;

		return render();
	}

	public Axis grid(final boolean grid) {

		this.grid=grid;

		return render();
	}


	public Axis scale(final NumericScale<?> scale) {

		if ( scale == null ) {
			throw new IllegalArgumentException("null scale");
		}

		this.scale=scale;

		return render();
	}

	public Axis area(final float width, final float height) {

		if ( width < 0 ) {
			throw new IllegalArgumentException("illegal width ["+width+"]");
		}

		if ( height < 0 ) {
			throw new IllegalArgumentException("illegal height ["+height+"]");
		}

		this.width=width;
		this.height=height;

		return render();
	}


	private Axis render() { // !!! avoid repeated execution

		for (final Orientation orientation : Orientation.values()) {
			root().is(name(orientation), false);
		}

		root().is(name(type), true).clear();

		if ( scale != null && width > 0 && height > 0 ) {

			final float[] ts=scale.ticks();

			for (final float tick : ts) {

				final float offset=scale.range(tick, 0, type == Horizontal ? width : type == Vertical ? height : 0);

				if ( ticks ) {
					root().append($(line(0, 0, 0, TickSize).translate(offset, height)).is("tick", true));
				}

				if ( values ) {
					root().append($(text(scale.format(tick))).async(new Action<Event>() {
						@Override public void execute(final Event e) {

							final Text text=e.current().as();
							final SVG.Box box=text.box();

							if ( type == Horizontal ) {
								text.translate(offset-box.w()/2, height+box.h()+3*TickSize/2.0f);
							} else if ( type == Vertical ) {
								text.translate(-box.w()-10, height-offset+box.h()/4);
							}

						}
					}).is("value", true));
				}

				if ( grid ) {
					if ( type == Horizontal ) {
						root().append($(line(offset, 0, offset, height)).is("grid", true));
					} else if ( type == Vertical ) {
						root().append($(line(0, height-offset, width, height-offset)).is("grid", true));
					}
				}
			}

			if ( base ) {
				if ( type == Horizontal ) {

					final float x=scale.range(ts[0], 0, width); // !!! absolute/relative

					root().append($(line(x, 0, x, height)).is("base", true));

				} else if ( type == Vertical ) {

					final float y=scale.range(ts[0], 0, height); // !!! absolute/relative

					root().append($(line(0, height-y, width, height-y)).is("base", true));
				}
			}

		}

		return this;
	}


	private String name(final Orientation orientation) {
		return orientation == null ? "" : orientation.name().toLowerCase();
	}
}
