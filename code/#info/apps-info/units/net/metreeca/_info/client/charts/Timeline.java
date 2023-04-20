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

import net.metreeca._info.client.Axis;
import net.metreeca._info.client.Chart;
import net.metreeca._info.client.Info;
import net.metreeca._info.shared.*;
import net.metreeca.tile.client.Action;
import net.metreeca.tile.client.Event;

import com.google.gwt.core.client.GWT;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.TextResource;

import static net.metreeca._info.client.SVG.*;
import static net.metreeca.tile.client.Tile.$;


public final class Timeline extends Chart {

	private static final Resources resources=GWT.create(Resources.class);

	public static interface Resources extends ClientBundle {

		@Source("Timeline.css") TextResource skin();

		@Source("TimelineInfo.css") TextResource info();

	}


	private Series time;
	private Series values;


	public Timeline() {
		root()

				.skin(resources.skin().getText())

				.window()

				.resize(new Action<Event>() { // !!! memory leakage
					@Override public void execute(final Event e) { render(); }
				});
	}


	public Timeline time(final Series time) {

		if ( time == null ) {
			throw new IllegalArgumentException("null time");
		}

		this.time=time;

		return this;
	}

	public Timeline values(final Series values) {

		if ( values == null ) {
			throw new IllegalArgumentException("null values");
		}

		this.values=values;

		return this;
	}


	public Timeline draw() {

		root().async(new Action<Event>() { // give the caller a chance to attach before rendering
			@Override public void execute(final Event e) { render(); }
		});

		return this;
	}


	private Timeline render() {

		final float width=root().width();
		final float height=root().height();

		root().clear();

		if ( width > 0 && height > 0 ) { // !!! sensible lower limits

			final TimeScale time=new TimeScale().adapted(true).relative(true).domain(this.time);
			final LinearScale value=new LinearScale().adapted(true).relative(true).domain(values);

			final int left=75; // !!! adapt to labels
			final int right=50; // !!! adapt to labels
			final int top=25; // !!! adapt to labels
			final int bottom=50; // !!! adapt to labels

			final float canvasWidth=width-left-right;
			final float canvasHeight=height-top-bottom;

			final Line hair=hair();
			final Info info=new Info();

			root().append($(svg(width, height))

					.append($(group().translate(left, top))

							.append(vaxis(value, canvasWidth, canvasHeight))
							.append(haxis(time, canvasWidth, canvasHeight))

							.append($(group())

									.append($(area(canvasWidth, canvasHeight)))
									.append($(data(canvasWidth, canvasHeight, time, value)))
									.append($(hair).hide())
									.append($(info).hide())

									.mouseenter(new Action<Event>() {
										@Override public void execute(final Event e) {
											$(hair).show();
											info.open();
										}
									})

									.mouseleave(new Action<Event>() {
										@Override public void execute(final Event e) {
											$(hair).hide();
											info.close();
										}
									})

									.mousemove(new Action<Event>() {

										@Override public void execute(final Event e) {

											final Shape<?> shape=e.current().as();

											final Point point=shape.point(e);

											final float x=point.x();

											final int i=index(Timeline.this.time, (long)time.domain(x, 0, canvasWidth));
											final long t=Timeline.this.time.time(i);
											final float v=values.number(i);

											final float y=value.range(v, 0, canvasHeight);

											final Point screen=shape.screen(x, canvasHeight-y);

											hair.sx(x).sy(-Axis.TickSize).tx(x).ty(canvasHeight+Axis.TickSize);

											info.spot(screen.x(), e.y(true)).text($("<div/>")

													.skin(resources.info().getText()) // !!! review

													.append($("<span/>").is("value", true).text(value.technical(v)))
													.append($("<span/>").is("time", true).text(time.format(t))));

										}

										private int index(final Series times, final long time) { // the index o the closest time value

											int index=0;
											long delta=-1;

											for (int i=0, length=times.length(); i < length; ++i) {

												final long t=times.time(i);
												final long d=Math.abs(time-t);

												if ( t >= 0 && (delta < 0 || d < delta) ) {
													index=i;
													delta=d;
												}
											}

											return index;
										}

									}))));
		}

		return this;
	}

	private Axis haxis(final NumericScale<?> scale, final float width, final float height) {
		return new Axis().type(Orientation.Horizontal)
				.ticks(true).values(true)
				.scale(scale).area(width, height);
	}

	private Axis vaxis(final NumericScale<LinearScale> value, final float width, final float height) {
		return new Axis().type(Orientation.Vertical)
				.base(true).grid(true).values(true)
				.scale(value).area(width, height);
	}


	private Line hair() {
		return $(line()).is("hair", true).as();
	}

	private Rect area(final float width, final float height) {
		return $(rect(width, height).fill("none").stroke("none")).is("area", true).as();
	}

	private Polyline data(final float width, final Float height, final TimeScale time, final NumericScale<?> value) {

		final Polyline polyline=polyline();

		if ( values.length() > 0 ) { // !!! times?

			polyline.point(time.range(this.time.time(0), 0, width), height-value.range(values.number(0), 0, height));

			for (int i=1, length=values.length(); i < length; ++i) {
				polyline.point(time.range(this.time.time(i), 0, width), height-value.range(values.number(i), 0, height));
			}
		}

		return $(polyline).is("data c10 _0", true).as(); // !!!
	}
}
